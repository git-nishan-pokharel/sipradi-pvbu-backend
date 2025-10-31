import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { RedisService } from './redis.service';
import { JwtAuthGuard } from 'apps/pvbu-backend/src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('state')
export class StateController {
  constructor(private readonly redisService: RedisService) {}

  @Get(':entityType/:entityId/:dataType')
  async getState<T>(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
    @Param('dataType') dataType: string,
  ): Promise<T | { message: string } | object> {
    const data = await this.redisService.getData(
      entityType,
      entityId,
      dataType,
    );
    return data ?? { message: 'State not found' };
  }

  @Delete(':entityType/:entityId/:dataType')
  async deleteState(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: number,
    @Param('dataType') dataType: string,
  ): Promise<{ message: string }> {
    await this.redisService.deleteData(entityType, entityId, dataType);
    return { message: 'State deleted successfully' };
  }
}
