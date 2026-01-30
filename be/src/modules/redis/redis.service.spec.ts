import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { RedisService } from './redis.service';

const mockRedisClient = {
  xadd: jest.fn(),
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPingRequest', () => {
    it('should add message to stream with correct parameters including MAXLEN', async () => {
      const clientId = 'test-client';
      const expectedMessageId = '12345-0';

      mockRedisClient.xadd.mockResolvedValue(expectedMessageId);

      const result = await service.addPingRequest(clientId);

      expect(result).toBe(expectedMessageId);

      expect(mockRedisClient.xadd).toHaveBeenCalledWith(
        'ping_stream',
        'MAXLEN',
        '~',
        1000,
        '*',
        'clientId',
        clientId,
        'message',
        'ping',
      );
    });
  });
});