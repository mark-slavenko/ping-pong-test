import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

import { PingGateway } from './ping.gateway';

@Injectable()
export class RedisConsumerService implements OnModuleInit {
  private readonly logger = new Logger(RedisConsumerService.name);

  constructor(
    @Inject('REDIS_SUBSCRIBER') private readonly redis: Redis,
    private readonly pingGateway: PingGateway,
  ) {}

  onModuleInit() {
    this.consumeStream();
  }

  async consumeStream() {
    const streamKey = 'ping_stream';
    let lastId = '$'; // only new messages

    this.logger.log('Started listening to Redis Stream (Subscriber Connection)...');

    while (true) {
      try {
        const response = await this.redis.xread(
          'BLOCK',
          0,
          'STREAMS',
          streamKey,
          lastId,
        );

        if (response) {
          const [stream] = response;
          const messages = stream[1];

          for (const message of messages) {
            const [messageId, messageBody] = message;

            const parsedBody = this.parseMessage(messageBody);

            this.logger.log(`Processing message: ${messageId} from ${parsedBody.clientId}`);

            const pongPayload = {
              originalMessageId: messageId,
              clientId: parsedBody.clientId,
              message: 'pong',
              timestamp: new Date().toISOString(),
            };

            this.pingGateway.broadcastPong(pongPayload);

            // Update lastId so we don't process the same message again
            lastId = messageId;
          }
        }
      } catch (error) {
        this.logger.error('Error reading from Redis Stream', error.stack);
        // Wait a bit before retrying to avoid crash loops
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  private parseMessage(messageBody: string[]): any {
    const result = {};
    for (let i = 0; i < messageBody.length; i += 2) {
      result[messageBody[i]] = messageBody[i + 1];
    }
    return result;
  }
}