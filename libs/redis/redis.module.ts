import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClientType> => {
        const client: RedisClientType = createClient({
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        });

        await client.connect();
        Logger.log('💿 Redis connected', 'RedisModule');

        client.on('error', (err) => {
          Logger.error('Redis error: ' + err, 'RedisModule');
        });

        return client;
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_PUB_CLIENT',
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClientType> => {
        const client: RedisClientType = createClient({
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
          socket: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        });

        await client.connect();
        Logger.log('💿 Redis connected', 'RedisModule');

        client.on('error', (err) => {
          Logger.error('Redis error: ' + err, 'RedisModule');
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', 'REDIS_PUB_CLIENT', RedisService],
})
export class RedisModule {}
