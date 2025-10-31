import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SparrowSMSService } from './sparrow-sms.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [SparrowSMSService],
  exports: [SparrowSMSService],
})
export class SparrowSmsModule {}
