import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { UserRole } from '../enum/auth.enum';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/, {
    message:
      'Password must be at least 6 characters long, include at least one uppercase letter and one special character',
  })
  newPassword: string;
}
