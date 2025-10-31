import { IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../enum/auth.enum';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User identifier, can be email or phone number',

    example: 'sipradi_pvbu_admin@yopmail.com',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User role',
    example: UserRole.owner,
    enum: UserRole,
  })
  @IsString()
  @IsNotEmpty()
  role: UserRole;
}
