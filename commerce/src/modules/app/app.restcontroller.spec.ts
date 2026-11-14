import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.restcontroller.js';
import { AppService } from '../../services/app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return app info', () => {
      const getRes = appController.getInfo();

      expect(getRes).toEqual({
        status: {
          code: 'SUCCESS',
          message: 'success get app info',
        },
        data: {
          app_name: 'Commerce Service',
          app_version: '0.0.1',
        }
      });
    });
  });
});
