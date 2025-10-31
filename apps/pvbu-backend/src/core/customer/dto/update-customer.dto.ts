import { IsDate, IsEnum, IsString, Matches } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';
import { Type } from 'class-transformer';
import { EGender } from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { PartialType } from '@nestjs/swagger';

export class UpdatePartialPassengerDto {
  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsDate()
  @Type(() => Date)
  dob?: Date;

  @IsEnum(EGender)
  gender?: EGender;
}

export class UpdatePasswordDto {
  @IsString()
  password: string;

  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
    message:
      'Password must be at least 6 characters long, include at least one uppercase letter and one special character',
  })
  newPassword: string;
}

export class UpdatePassengerDto extends PartialType(CreateCustomerDto) {}
