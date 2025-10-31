import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    @Inject('REDIS_PUB_CLIENT')
    private readonly redisPubClient: RedisClientType,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
        Logger.log('Redis connected', 'RedisService');
      }

      if (!this.redisPubClient.isOpen) {
        await this.redisPubClient.connect();
        Logger.log('Redis publisher connected', 'RedisService');
      }
    } catch (error) {
      Logger.error('Failed to connect to Redis', error, 'RedisService');
    }
  }

  // Generate dynamic keys
  private generateKey(
    entityType: string,
    entityId?: number,
    dataType?: string,
  ): string {
    let key = entityType;
    if (entityId !== undefined) {
      key += `:${entityId}`;
    }
    if (dataType) {
      key += `:${dataType}`;
    }
    return key;
  }

  // Save or update data
  async setData<T>(
    entityType: string,
    entityId?: number,
    dataType?: string,
    data?: T,
  ): Promise<void> {
    const key = this.generateKey(entityType, entityId, dataType);

    await this.redisClient.set(
      key,
      JSON.stringify({ ...data, timestamp: Date.now() }),
    );
  }

  // Save or update data
  async addSetData<T>(
    entityType: string,
    entityId?: number,
    dataType?: string,
    data?: T,
  ): Promise<void> {
    const key = this.generateKey(entityType, entityId, dataType);
    await this.redisClient.SADD(key, data as string);
  }

  // Get data
  async getData<T>(
    entityType: string,
    entityId?: number,
    dataType?: string,
  ): Promise<T | null> {
    const key = this.generateKey(entityType, entityId, dataType);
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Get data
  async getSetData(
    entityType: string,
    entityId?: number,
    dataType?: string,
  ): Promise<string[]> {
    const key = this.generateKey(entityType, entityId, dataType);
    const data = await this.redisClient.sMembers(key);
    return data ?? null;
  }

  // Get data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMultipleData(keys: string[]): Promise<any> {
    const data = await this.redisClient.mGet(keys);
    return data ?? null;
  }

  // Delete data
  async deleteData(
    entityType: string,
    entityId?: number,
    dataType?: string,
  ): Promise<void> {
    const key = this.generateKey(entityType, entityId, dataType);
    await this.redisClient.del(key);
  }

  // Get all data for an entity type
  async getAllDataByEntityType<T>(entityType: string): Promise<T[]> {
    const keys = await this.redisClient.keys(`${entityType}:*`);
    const data: (string | null)[] = await Promise.all(
      keys.map(
        (key: string): Promise<string | null> => this.redisClient.get(key),
      ),
    );
    return data.filter(Boolean).map((item) => JSON.parse(item!));
  }

  async shutdown(): Promise<void> {
    await this.redisClient.quit();
  }

  // Add publish method
  async publish(
    channel: string,
    message: Record<string, unknown>,
  ): Promise<number> {
    try {
      const serializedMessage = JSON.stringify(message);
      return await this.redisClient.publish(channel, serializedMessage);
    } catch (error) {
      Logger.error(
        `Failed to publish message: ${error.message}`,
        'RedisService',
      );
      throw error;
    }
  }

  // Add subscribe method
  async subscribe(
    channel: string,
    callback: (message: Record<string, unknown>) => void,
  ): Promise<void> {
    try {
      await this.redisPubClient.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          Logger.error(
            `Failed to parse message: ${error.message}`,
            'RedisService',
          );
        }
      });
    } catch (error) {
      Logger.error(`Failed to subscribe: ${error.message}`, 'RedisService');
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.redisPubClient.unsubscribe(channel);
    } catch (error) {
      Logger.error(`Failed to unsubscribe: ${error.message}`, 'RedisService');
      throw error;
    }
  }
}
