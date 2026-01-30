import { Module, Global, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { PingGateway } from './ping.gateway';
import { RedisConsumerService } from './redis-consumer.service';

@Global()
@Module({
  controllers: [RedisController],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisClient');
        return new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            logger.warn(`Redis connection lost. Retrying in ${delay}ms... (Attempt ${times})`);
            return delay;
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisSubscriber');
        return new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            logger.warn(`Redis subscriber lost. Retrying in ${delay}ms... (Attempt ${times})`);
            return delay;
          },
        });
      },
      inject: [ConfigService],
    },
    RedisService,
    PingGateway,
    RedisConsumerService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule implements OnModuleDestroy {
  private readonly logger = new Logger(RedisModule.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
  ) {}

  async onModuleDestroy() {
    // Gracefully close connections when the app stops
    await this.redisClient.quit();
    await this.redisSubscriber.quit();
    this.logger.log('Redis connections closed.');
  }
}