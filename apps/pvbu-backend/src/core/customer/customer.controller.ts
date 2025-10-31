import { PaginationParamsDto } from '@app/dtos';
import {
  Paginate,
  PaginationMeta,
} from '@app/pagination/decorators/pagination.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IRequest } from '../../common/interfaces/irequest.interface';
import {
  FetchCustomerFilterDto,
  SingleCustomerFilterDto,
} from './dto/filter-customer.dto';
import {
  UpdatePartialPassengerDto,
  UpdatePassengerDto,
  UpdatePasswordDto,
} from './dto/update-customer.dto';
import { CustomerService } from './customer.service';
import { AccessControlDecorator } from 'libs/access-control/decorators/access-control.decorator';
import { AccessValidatorGuard } from 'libs/access-control/guards/access-validator.guard';
import {
  Action,
  AppResource,
} from '../../../../../libs/access-control/enums/access.enum';
import { User } from 'apps/pvbu-backend/prisma/generated/prisma/client';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessValidatorGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.passenger,
  })
  @Get()
  async findAll(
    @Query() query: FetchCustomerFilterDto,
    @Paginate() paginationParams: PaginationParamsDto,
  ): Promise<{ items: Partial<User>[]; pagination: PaginationMeta }> {
    return this.customerService.findAllPaginated(
      { ...query },
      paginationParams,
      undefined,
      ['firstName', 'lastName', 'email', 'phoneNumber'],
      {
        password: true,
        passwordChangedAt: true,
        resetOtp: true,
        resetOtpExpiresAt: true,
        resetPasswordToken: true,
        resetTokenExpiresAt: true,
        phoneOtp: true,
        phoneOtpExpiresAt: true,
      },
    );
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.passenger,
  })
  @Get('demographic')
  async getDemographic(): Promise<{
    male: number;
    female: number;
    other: number;
  }> {
    const demographic = await this.customerService.getDemographic();
    return demographic;
  }

  @ApiParam({ name: 'id', description: 'Passenger ID', type: Number })
  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.passenger,
  })
  @Get(':id')
  async findOne(
    @Query() query: SingleCustomerFilterDto,
    @Param('id') id: string,
  ): Promise<User | null> {
    return this.customerService.findById(
      +id,
      undefined,
      undefined,
      {
        password: true,
        passwordChangedAt: true,
        resetOtp: true,
        resetOtpExpiresAt: true,
        resetPasswordToken: true,
        resetTokenExpiresAt: true,
        phoneOtp: true,
        phoneOtpExpiresAt: true,
      },
      { ...query },
    );
  }

  @AccessControlDecorator({
    action: Action.updateSelf,
    resource: AppResource.passenger,
  })
  @Patch('self-update')
  async selfUpdate(
    @Req() req: IRequest,
    @Body() updatePassengerDto: UpdatePartialPassengerDto,
  ): Promise<{ message: string }> {
    await this.customerService.update(req.user.id, updatePassengerDto);
    return {
      message: 'Passenger updated successfully',
    };
  }

  @AccessControlDecorator({
    action: Action.updateSelf,
    resource: AppResource.passenger,
  })
  @Patch('change-password')
  async selfUpdatePassword(
    @Req() req: IRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.customerService.updatePassword(req.user.id, updatePasswordDto);
    return {
      message: 'Password updated successfully',
    };
  }

  @ApiParam({ name: 'id', description: 'Passenger ID', type: Number })
  @AccessControlDecorator({
    action: Action.update,
    resource: AppResource.passenger,
  })
  @Patch(':id')
  async update(
    @Query() query: SingleCustomerFilterDto,
    @Param('id') id: string,
    @Body() updatePassengerDto: UpdatePassengerDto,
  ): Promise<{ message: string }> {
    await this.customerService.update(
      +id,
      updatePassengerDto,
      undefined,
      undefined,
      { ...query },
    );
    return {
      message: 'Passenger updated successfully',
    };
  }

  @ApiParam({ name: 'id', description: 'Passenger ID', type: Number })
  @AccessControlDecorator({
    action: Action.delete,
    resource: AppResource.passenger,
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.customerService.remove(+id);
    return {
      message: 'Passenger removed successfully',
    };
  }

  @AccessControlDecorator({
    action: Action.read,
    resource: AppResource.passenger,
  })
  @Get('stats/count')
  async getPassengersCount(
    @Query() query: SingleCustomerFilterDto,
  ): Promise<{ message: string; count: number }> {
    const count = await this.customerService.getPassengersCount({ ...query });
    return {
      message: 'Total passengers count fetched successfully',
      count: count,
    };
  }

  @AccessControlDecorator({
    action: Action.updateSelf,
    resource: AppResource.passenger,
  })
  @Get(':id/presigned-url')
  async getPresignedUrl(@Param('id') id: string): Promise<{ url: string }> {
    return this.customerService.getPresignedUrl(+id);
  }
}
