import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      Logger.log('Database connected successfully...');
    } catch (error) {
      Logger.error('Error connecting to the database... ');
      process.exit(1);
    }
  }
}
