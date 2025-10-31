import { ApiProperty } from '@nestjs/swagger';
import { AccessRuleEffect } from 'apps/pvbu-backend/prisma/generated/prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class RuleActionDto {
  @IsInt()
  @IsPositive()
  resourceActionId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  actionConditionId?: number;
}

export class CreateAccessRulesDto {
  @ApiProperty({ example: [{ resourceActionId: 1, actionConditionId: 2 }] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  allowActions: RuleActionDto[];

  @ApiProperty({ example: [{ resourceActionId: 1, actionConditionId: 2 }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  denyActions: RuleActionDto[];

  @ApiProperty({ example: '1' })
  @IsNumber()
  policyId: number;
}

export interface CreateRuleObject {
  resourceActionId: number;
  actionConditionId: number | null;
  resource: string;
  policyId: number;
  effect: AccessRuleEffect;
  ruleIdentifier: string;
}

export type AccessRulePayload = CreateRuleObject[];

export class UpdateAccessRulesDto {
  @ApiProperty({ example: [{ resourceActionId: 1, actionConditionId: 2 }] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  allowActions: RuleActionDto[];

  @ApiProperty({ example: [{ resourceActionId: 1, actionConditionId: 2 }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleActionDto)
  denyActions: RuleActionDto[];
}

export interface UpdateAccessRulePayload {
  add: CreateRuleObject[];
  update: CreateRuleObject[];
  remove: CreateRuleObject[];
}
