import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../services/app.service.js';
import { GetAppInfoResponse } from '../../restgen/models/GetAppInfoResponse.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/v1/app/info')
  getInfo(): GetAppInfoResponse {
    return {
      status: {
        code: 'SUCCESS',
        message: 'success get app info',
      },
      data: {
        app_name: this.appService.getInfo(),
        app_version: this.appService.getVersion(),
      }
    };
  }
}
