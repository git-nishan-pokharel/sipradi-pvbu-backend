import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma';
import { CustomerModule } from './core/customer/customer.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/pvbu-backend/.env',
    }),
    PrismaModule,
    CustomerModule,
    AuthModule,
  ],
})
export class AppModule {}
