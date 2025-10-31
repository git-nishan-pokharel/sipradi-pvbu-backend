import { Module } from '@nestjs/common';
import { PaginationService } from './pagination.service';
import { Paginate } from './decorators/pagination.decorator';

@Module({
  providers: [PaginationService],
  exports: [PaginationService, Paginate],
})
export class PaginationModule {}
