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
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getInfo: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getInfo', () => {
    let request: GetInfoRequest;

    beforeEach(() => {
      request = {} as GetInfoRequest;
    });

    it('should return successful response', () => {
      vi.spyOn(appService, 'getInfo').mockReturnValue('Commerce Service');

      const expected: GetInfoResponse = {
        status: {
          code: 'SUCCESS',
          message: 'Commerce Service',
        },
      };

      const result = controller.getInfo(request);

      expect(result).toEqual(expected);
      expect(appService.getInfo).toHaveBeenCalledTimes(1);
    });

    it('should return the message provided by AppService', () => {
      vi.spyOn(appService, 'getInfo').mockReturnValue('Another Service');

      const result = controller.getInfo(request);

      expect(result.status?.message).toBe('Another Service');
    });
  });
});