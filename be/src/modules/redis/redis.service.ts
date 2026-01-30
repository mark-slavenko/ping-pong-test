import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async addPingRequest(clientId: string): Promise<string | null> {
    const streamKey = 'ping_stream';

    const messageId = await this.redis.xadd(
      streamKey,
      'MAXLEN', '~', 1000,
      '*',
      'clientId', clientId,
      'message', 'ping'
    );

    this.logger.log(`Ping request added to stream. ID: ${messageId}, Client: ${clientId}`);
    return messageId;
  }
}