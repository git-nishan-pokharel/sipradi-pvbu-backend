import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestPhoneOtpDto } from './dto/request-phone-otp.dto';
import { CustomerService } from '@src/core/customer/customer.service';
import { CreateCustomerDto } from '@src/core/customer/dto/create-customer.dto';
import { RegisterCustomerResponseDto } from '@src/core/customer/dto/register-customer-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RequestResetPasswordOtpDto } from './dto/request-reset-password-otp.dto';
import { VerifyPasswordResetOtpDto } from './dto/verify-password-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { IRequest } from '../common/interfaces/irequest.interface';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from './enum/auth.enum';
import { GroupPolicy } from 'libs/access-control/enums/access.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(
    @Request() req: IRequest,
  ): Promise<
    LoginResponseDto & { accessRules: { items: GroupPolicy } | null }
  > {
    return this.authService.login(req.user);
  }

  @Post('request-reset-password-otp')
  async requestResetPasswordOtp(
    @Body() requestResetPasswordOtpDto: RequestResetPasswordOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.requestResetPasswordOtp(requestResetPasswordOtpDto);
  }

  @Post('verify-password-reset-otp')
  async verifyPasswordResetOtp(
    @Body() verifyPasswordResetOtpDto: VerifyPasswordResetOtpDto,
  ): Promise<{ resetToken: string }> {
    return this.authService.verifyPasswordResetOtp(verifyPasswordResetOtpDto);
  }

  @Post('reset-password')
  async setNewPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('request-phone-otp')
  requestPhoneOtp(
    @Body() requestPhoneOtpDto: RequestPhoneOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.requestPhoneOtp(requestPhoneOtpDto);
  }

  @Post('verify-phone-otp')
  async verifyPhoneOtp(
    @Body() verifyPhoneOtpDto: VerifyPhoneOtpDto,
  ): Promise<{ message: string }> {
    return this.authService.verifyPhoneOtp(verifyPhoneOtpDto);
  }

  @Post('register-passenger')
  async registerPassenger(
    @Body() createPassengerDto: CreateCustomerDto,
  ): Promise<RegisterCustomerResponseDto> {
    return this.customerService.registerPassenger(createPassengerDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Req() req: IRequest): Promise<Record<string, unknown>> {
    if (!req.user) throw new NotFoundException('User not found');
    const userDetails = await this.authService.getCurrentUser(
      req?.user?.id,
      req?.user?.role as UserRole,
    );
    return userDetails;
  }
}
