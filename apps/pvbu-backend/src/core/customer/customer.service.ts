/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaService } from '@app/prisma';
import { SparrowSMSService } from '@app/sparrow-sms';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { RegisterCustomerResponseDto } from './dto/register-customer-response.dto';
import { generateOtp } from '@app/utils';
import { PrismaRepository } from '@app/prisma/prisma.repository';
import { User, Prisma } from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { UpdatePasswordDto } from './dto/update-customer.dto';
import { SingleCustomerFilterDto } from './dto/filter-customer.dto';
import { AwsS3Service } from '@app/aws';

@Injectable()
export class CustomerService extends PrismaRepository<User> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly sparrowSMSService: SparrowSMSService,
    private readonly awsS3Service: AwsS3Service,
  ) {
    super(prisma, 'user');
  }

  async registerPassenger(
    createCustomerDto: CreateCustomerDto,
  ): Promise<RegisterCustomerResponseDto> {
    const hashedPassword = await bcrypt.hash(createCustomerDto.password, 10);

    const otp = await generateOtp();

    let customer = null;

    try {
      const customerInfo = await this.prisma.$transaction(async (db) => {
        const policy = await db.accessPolicy.findUnique({
          where: { title: 'User' },
          select: { id: true },
        });

        customer = await this.create({
          registeredName: createCustomerDto.registeredName,
          displayName: createCustomerDto.displayName,
          email: createCustomerDto.email,
          registeredPhoneNumber: createCustomerDto.registeredPhoneNumber,
          contactPhoneNumber: createCustomerDto.contactPhoneNumber,
          password: hashedPassword,
          passwordResetOtp: otp,
          passwordResetOtpExpirationTime: new Date(Date.now() + 5 * 60 * 1000),
          ...(policy?.id && {
            accessId: policy.id,
          }),
        });

        return customer;
      });

      await this.sparrowSMSService.sendSMS(
        createCustomerDto.contactPhoneNumber,
        `Your OTP for Sipradi PVBU is ${otp}. It is valid for 5 minutes.`,
        process.env.SPARROW_SMS_FROM,
      );

      customer = customerInfo;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error?.code === 'P2002'
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Some error occurred',
          error.message,
        );
      }
    }

    const {
      password,
      resetOtp,
      resetPasswordToken,
      resetOtpExpiresAt,
      resetTokenExpiresAt,
      ...safeData
    } = customer;

    return {
      message: 'User registered successfully.',
      passenger: safeData,
    };
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const { password, newPassword } = updatePasswordDto;

    if (password === newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the current password',
      );
    }

    const passenger = await this.findById(id);

    const isMatch = await bcrypt.compare(password, passenger.password);

    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    return this.update(id, {
      password: hashedNewPassword,
    });
  }

  async getPassengersCount(query: SingleCustomerFilterDto): Promise<number> {
    return await this.prisma.user.count({
      where: {
        ...query,
      },
    });
  }

  async getDemographic(): Promise<{
    male: number;
    female: number;
    other: number;
  }> {
    const genderGroups = await this.prisma.user.groupBy({
      by: ['gender'],
      _count: {
        gender: true,
      },
    });

    const gender_demographics = genderGroups.reduce(
      (acc, item) => {
        const gender = item.gender?.toLowerCase() as
          | 'male'
          | 'female'
          | 'other';
        if (gender) {
          acc[gender] = item._count.gender;
        }
        return acc;
      },
      { male: 0, female: 0, other: 0 },
    );

    return gender_demographics;
  }

  async getPresignedUrl(passengerId: number): Promise<{ url: string }> {
    const s3Key = `passengers/kycS/${passengerId}`;

    const uploadURL = await this.awsS3Service.getS3DefaultUploadUrl(s3Key);
    return { url: uploadURL };
  }
}
