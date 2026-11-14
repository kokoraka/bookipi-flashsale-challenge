import { Module } from '@nestjs/common';
import { AppController as RestAppController } from './app.restcontroller.js';
import { FlashSaleModule } from '../flashsale/flashsale.module.js'
import { AppService } from '../../services/app.service.js';

@Module({
  imports: [FlashSaleModule],
  controllers: [RestAppController],
  providers: [AppService],
})
export class AppModule {}
