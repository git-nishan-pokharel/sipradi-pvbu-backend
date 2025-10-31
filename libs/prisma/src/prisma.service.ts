import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'apps/pvbu-backend/prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      Logger.log('Connected to the database successfully', 'PrismaService');
    } catch (error) {
      Logger.error('Failed to connect to the database', error, 'PrismaService');
      process.exit(1);
    }
  }
}
