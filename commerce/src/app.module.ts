import { Module } from '@nestjs/common';
import { AppController as RestAppController } from './resthandlers/app.controller.js';
import { AppController as GrpcAppController } from './grpchandlers/app.controller.js';
import { AppService } from './services/app.service.js';

@Module({
  imports: [],
  controllers: [RestAppController, GrpcAppController],
  providers: [AppService],
})
export class AppModule {}
