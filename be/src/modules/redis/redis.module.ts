import { Module, Global } from '@nestjs/common';
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
        return new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: (configService: ConfigService) => {
        return new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
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
export class RedisModule {}