import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsPhoneNumber,
  Matches,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { EGender } from '../../../../prisma/generated/prisma/client';

export class CreateCustomerDto {
  @IsString()
  registeredName: string;
  @IsString()
  displayName: string;

  @Transform(({ value }) => value?.trim()?.toLowerCase())
  @IsEmail()
  email: string;

  @IsPhoneNumber('NP')
  registeredPhoneNumber: string;

  @IsPhoneNumber('NP')
  contactPhoneNumber: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
    message:
      'Password must be at least 6 characters long, include at least one uppercase letter and one special character',
  })
  password: string;

  @IsEnum(EGender)
  gender: EGender;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  rfid: string;
}
