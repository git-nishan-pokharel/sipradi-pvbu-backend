import {
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { UserRole } from '../enum/auth.enum';

export class RequestResetPasswordOtpDto {
  @IsString()
  @ValidateIf((o) => o.identifier.includes('@'))
  @IsEmail({}, { message: 'Invalid email format' })
  @ValidateIf((o) => !o.identifier.includes('@'))
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  identifier: string;

  @IsEnum(UserRole)
  role: UserRole;
}
