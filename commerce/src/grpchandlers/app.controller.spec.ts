
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './../services/app.service.js';
import {
  GetInfoRequest,
  GetInfoResponse,
} from './../grpcgen/app.js';

describe('AppController', () => {
  let controller: AppController;

  const appServiceMock = {
    getInfo: vi.fn<() => string>(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getInfo', () => {
    let request: GetInfoRequest;

    beforeEach(() => {
      request = {} as GetInfoRequest;
    });

    it('should return successful response', () => {
      appServiceMock.getInfo.mockReturnValue('Commerce Service');

      const expected: GetInfoResponse = {
        status: {
          code: 'SUCCESS',
          message: 'Commerce Service',
        },
      };

      const result = controller.getInfo(request);

      expect(result).toEqual(expected);
      expect(appServiceMock.getInfo).toHaveBeenCalledTimes(1);
    });

    it('should return the message provided by AppService', () => {
      appServiceMock.getInfo.mockReturnValue('Another Service');

      const result = controller.getInfo(request);

      expect(result.status?.message).toBe('Another Service');
    });
  });
});
