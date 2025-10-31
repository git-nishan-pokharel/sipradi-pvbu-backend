import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '@app/prisma';
import { AwsModule } from '@app/aws';
import { JwtModule } from '@nestjs/jwt';
import { SparrowSmsModule } from '@app/sparrow-sms';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '@app/utils';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SipradiPvbuAccessControlModule } from '../access-control/access-control.module';
import { CustomerModule } from '@src/core/customer/customer.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AwsModule,
    CustomerModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
    SparrowSmsModule,
    UtilsModule,
    SipradiPvbuAccessControlModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
