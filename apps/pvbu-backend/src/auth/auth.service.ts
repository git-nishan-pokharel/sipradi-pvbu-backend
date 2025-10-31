/* eslint-disable @typescript-eslint/no-explicit-any */
import { AwsSESService } from '@app/aws/aws-ses.service';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { SparrowSMSService } from '@app/sparrow-sms';
import { generateOtp } from '@app/utils';
import { AuthJwtPayload, Role } from '../common/interfaces/auth-jwt-payload';
import { IUserValidateResponse } from '../common/interfaces/user-response';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import * as bcrypt from 'bcrypt';
import { RequestResetPasswordOtpDto } from './dto/request-reset-password-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { randomUUID } from 'crypto';
import { VerifyPasswordResetOtpDto } from './dto/verify-password-reset-otp.dto';
import { UserRole } from './enum/auth.enum';
import { SipradiPvbuAccessPolicyService } from '../access-control/access-policy.service';
import { GroupPolicy } from 'libs/access-control/enums/access.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ses: AwsSESService,
    private readonly jwtService: JwtService,
    private readonly sparrowSMSService: SparrowSMSService,
    private readonly accessControlService: SipradiPvbuAccessPolicyService,
  ) {}

  private async validateHashMatch(
    providedValue: string,
    hashedValue: string,
  ): Promise<boolean> {
    try {
      const validatedResult = await bcrypt.compare(providedValue, hashedValue);
      return validatedResult;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async validateJwtPayload(
    payload: AuthJwtPayload,
  ): Promise<IUserValidateResponse> {
    const { email, role } = payload;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { registeredPhoneNumber: email }],
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { ...user, role };
  }

  async validateUser(
    identifier: string,
    password: string,
    role: Role,
  ): Promise<IUserValidateResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }],
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    // eslint-disable-next-line no-console
    console.log('User1: ', user);
    // const passwordMatch = await this.validateHashMatch(password, user.password);
    // if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');
    // eslint-disable-next-line no-console
    console.log('User2: ', user);
    return { ...user, role };
  }

  async login(
    user: IUserValidateResponse,
  ): Promise<
    LoginResponseDto & { accessRules: { items: GroupPolicy } | null }
  > {
    const { email, password, role } = user;
    // eslint-disable-next-line no-console
    console.log('User: ', user);
    const accessRules = user?.accessId
      ? await this.accessControlService.getRules(user?.accessId)
      : null;
    if (role === 'admin') {
      if (
        email == process.env.ADMIN_EMAIL &&
        password == process.env.ADMIN_PASSWORD
      ) {
        const payload = {
          sub: 'admin',
          email: email,
          role: 'admin',
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return {
          message: 'Login successful',
          accessToken,
          user: {
            id: '7dbc2890-f869-4d35-b91b-196b16a104db',
            registeredName: 'Admin',
            displayName: 'Administrator',
            email: email,
            role: 'admin',
          },
          accessRules,
        };
      }
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      phoneNumber: user.contactPhoneNumber,
      role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        registeredName: user.registeredName,
        displayName: user.displayName,
        email: user.email,
        phoneNumber: user.contactPhoneNumber,
        role,
      },
      accessRules,
    };
  }

  async requestResetPasswordOtp(
    requestResetPasswordOtpDto: RequestResetPasswordOtpDto,
  ): Promise<{ message: string }> {
    const user = await (
      this.prisma[requestResetPasswordOtpDto.role as any] as any
    ).findFirst({
      where: {
        OR: [
          { email: requestResetPasswordOtpDto.identifier },
          { phoneNumber: requestResetPasswordOtpDto.identifier },
        ],
      },
    });
    if (!user) throw new NotFoundException('Email not found');

    const otp = await generateOtp();

    try {
      await this.sparrowSMSService.sendSMS(
        user.phoneNumber,
        `Your OTP for Sipradi PVBU is ${otp}. It is valid for 10 minutes.`,
        process.env.SPARROW_SMS_FROM,
      );

      await (this.prisma[requestResetPasswordOtpDto.role as any] as any).update(
        {
          where: { id: user.id },
          data: {
            resetOtp: otp,
            resetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send reset password email',
        error.message,
      );
    }

    return { message: 'OTP sent to phone' };
  }

  async verifyPasswordResetOtp(
    verifyPasswordResetOtpDto: VerifyPasswordResetOtpDto,
  ): Promise<{ resetToken: string }> {
    const user = await (
      this.prisma[verifyPasswordResetOtpDto.role as any] as any
    ).findFirst({
      where: {
        OR: [
          { email: verifyPasswordResetOtpDto.identifier },
          { phoneNumber: verifyPasswordResetOtpDto.identifier },
        ],
      },
    });
    if (!user) throw new NotFoundException('User not found');

    if (
      !user.resetOtp ||
      user.resetOtp !== verifyPasswordResetOtpDto.otp ||
      !user.resetOtpExpiresAt ||
      new Date() > new Date(user.resetOtpExpiresAt)
    ) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    const resetToken = this.generateResetToken();

    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await (this.prisma[verifyPasswordResetOtpDto.role as any] as any).update({
      where: { id: user.id },
      data: {
        resetOtp: null,
        resetOtpExpiresAt: null,
        resetPasswordToken: resetToken,
        resetTokenExpiresAt: tokenExpiresAt,
      },
    });

    return { resetToken: resetToken };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await (
      this.prisma[resetPasswordDto.role as any] as any
    ).findFirst({
      where: {
        OR: [
          { email: resetPasswordDto.identifier },
          { phoneNumber: resetPasswordDto.identifier },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (new Date() > new Date(user.resetTokenExpiresAt)) {
      throw new BadRequestException('Reset token expired');
    }

    const hashedPassword = await this.hashPassword(
      resetPasswordDto.newPassword,
    );

    await (this.prisma[resetPasswordDto.role as any] as any).update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private generateResetToken(): string {
    return randomUUID();
  }

  async requestPhoneOtp(
    requestPhoneOtpDto: RequestPhoneOtpDto,
  ): Promise<{ message: string }> {
    const otp = await generateOtp();

    try {
      await this.sparrowSMSService.sendSMS(
        requestPhoneOtpDto.phoneNumber,
        `Your OTP for Sipradi PVBU is ${otp}. It is valid for 5 minutes.`,
        process.env.SPARROW_SMS_FROM,
      );

      await this.prisma.user.update({
        where: { registeredPhoneNumber: requestPhoneOtpDto.phoneNumber },
        data: {
          passwordResetOtp: otp,
          passwordResetOtpExpirationTime: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send OTP SMS',
        error.messsage,
      );
    }

    return { message: 'OTP sent to phone' };
  }

  async verifyPhoneOtp(
    verifyPhoneOtpDto: VerifyPhoneOtpDto,
  ): Promise<{ message: string }> {
    const otpRecord = await this.prisma.user.findFirst({
      where: {
        registeredPhoneNumber: verifyPhoneOtpDto.phoneNumber,
        passwordResetOtp: verifyPhoneOtpDto.otp,
        passwordResetOtpExpirationTime: {
          gte: new Date(),
        },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.user.update({
      where: { registeredPhoneNumber: verifyPhoneOtpDto.phoneNumber },
      data: {
        passwordResetOtp: null,
        passwordResetOtpExpirationTime: null,
      },
    });

    return { message: 'Phone number verified successfully' };
  }

  async getCurrentUser(
    id: string,
    role: UserRole,
  ): Promise<Record<string, unknown>> {
    const user = await (this.prisma[role as any] as any).findFirst({
      where: {
        id,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    delete user.password;
    delete user.resetOtp;
    delete user.resetOtpExpiresAt;
    delete user.resetPasswordToken;
    delete user.resetTokenExpiresAt;

    if (!user?.accessId) {
      return { ...user, role };
    }

    const accessRules = await this.accessControlService.getRules(
      user?.accessId,
    );

    return { ...user, role, accessRules };
  }
}
