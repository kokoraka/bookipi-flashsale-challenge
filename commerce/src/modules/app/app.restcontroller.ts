import { Controller, Get } from '@nestjs/common';
import { AppService } from '../../services/app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/v1/app/info')
  getInfo(): object {
    return {
      status: {
        code: "SUCCESS",
        message: this.appService.getInfo(),
      }
    };
  }
}
