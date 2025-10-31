import { PaginationParamsDto } from '@app/dtos';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class FetchCustomerFilterDto extends PaginationParamsDto {
  @ApiPropertyOptional({ description: 'Search', example: '' })
  @IsOptional()
  @IsNumber()
  id?: string;
}

export class SingleCustomerFilterDto {
  @ApiPropertyOptional({ description: 'Search', example: '' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: string;
}
