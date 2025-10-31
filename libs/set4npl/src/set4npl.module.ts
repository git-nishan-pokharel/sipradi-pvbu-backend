import { Module } from '@nestjs/common';
import { Set4nplService } from './set4npl.service';

@Module({
  providers: [Set4nplService],
  exports: [Set4nplService],
})
export class Set4nplModule {}
