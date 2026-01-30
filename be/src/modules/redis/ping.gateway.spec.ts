import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { PingGateway } from './ping.gateway';

describe('PingGateway', () => {
  let gateway: PingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingGateway],
    }).compile();

    gateway = module.get<PingGateway>(PingGateway);

    // Manually mock the Server property as it's injected via @WebSocketServer decorator
    gateway.server = {
      emit: jest.fn(),
    } as any;

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('broadcastPong', () => {
    it('should emit "pong" event with data', () => {
      const data = {
        originalMessageId: '123',
        clientId: 'abc',
        message: 'pong',
        timestamp: '2024-01-01',
      };

      gateway.broadcastPong(data);

      expect(gateway.server.emit).toHaveBeenCalledWith('pong', data);
    });
  });
});