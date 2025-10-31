import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccessPolicyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
