import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async addPingRequest(clientId: string): Promise<string | null> {
    const streamKey = 'ping_stream';

    const messageId = await this.redis.xadd(
      streamKey,
      '*',
      'clientId', clientId,
      'message', 'ping'
    );

    console.log(`[Redis Producer] Added message ${messageId} from client ${clientId}`);
    return messageId;
  }
}