import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
