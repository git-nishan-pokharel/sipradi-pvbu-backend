import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MapService],
  exports: [MapService],
})
export class MapModule {}
