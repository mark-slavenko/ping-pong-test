import { Test, TestingModule } from '@nestjs/testing';

import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { PingDto } from './dto/ping.dto';

describe('RedisController', () => {
  let controller: RedisController;
  let redisService: RedisService;

  const mockRedisService = {
    addPingRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedisController],
      providers: [
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<RedisController>(RedisController);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ping', () => {
    it('should call service and return acknowledgment', async () => {
      const dto: PingDto = { clientId: 'test-user' };
      const mockId = '17000000-0';

      mockRedisService.addPingRequest.mockResolvedValue(mockId);

      const result = await controller.ping(dto);

      expect(redisService.addPingRequest).toHaveBeenCalledWith(dto.clientId);
      expect(result).toEqual({
        status: 'ack',
        messageId: mockId,
        info: 'Request queued',
      });
    });
  });
});