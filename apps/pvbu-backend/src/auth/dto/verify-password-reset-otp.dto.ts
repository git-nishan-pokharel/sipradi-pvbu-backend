import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../enum/auth.enum';

export class VerifyPasswordResetOtpDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
