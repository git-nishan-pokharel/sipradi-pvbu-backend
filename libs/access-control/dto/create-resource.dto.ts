import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  actions: string[];
}

export class AddActionsDto {
  @IsArray()
  @ArrayNotEmpty()
  actions: string[];
}

export class AddActionConditionDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: { keyId: '${resourceContext.key}' } })
  @IsObject()
  condition: Record<string, string>;
}
