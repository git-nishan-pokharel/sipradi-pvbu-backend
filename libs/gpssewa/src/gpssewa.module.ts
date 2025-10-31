import { Module } from '@nestjs/common';
import { GpssewaService } from './gpssewa.service';

@Module({
  providers: [GpssewaService],
  exports: [GpssewaService],
})
export class GpssewaModule {}
