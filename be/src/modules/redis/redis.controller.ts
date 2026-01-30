import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { RedisService } from './redis.service';
import { PingDto } from './dto/ping.dto';

@Controller('api')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('ping')
  @HttpCode(200)
  async ping(@Body() pingDto: PingDto) {
    const id = await this.redisService.addPingRequest(pingDto.clientId);

    return {
      status: 'ack',
      messageId: id,
      info: 'Request queued',
    };
  }
}