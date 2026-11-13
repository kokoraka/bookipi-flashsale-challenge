import { Controller } from '@nestjs/common';
import {
  GetInfoResponse,
  GetInfoRequest,
  AppServiceController,
  AppServiceControllerMethods,
} from './../grpcgen/app.js';
import { AppService } from './../services/app.service.js';

@Controller()
@AppServiceControllerMethods()
export class AppController implements AppServiceController {
  constructor(private readonly appService: AppService) { }

  getInfo(_request: GetInfoRequest): GetInfoResponse {
    const message = this.appService.getInfo()
    return {
      status: {
        code: "SUCCESS",
        message,
      }
    };
  }
}
