import { IsPhoneNumber } from 'class-validator';

export class RequestPhoneOtpDto {
  @IsPhoneNumber('NP')
  phoneNumber: string;
}
