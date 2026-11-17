import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { RedisStreamClient } from '@nestjs-redis/streams-transporter';
import { SERVICE_ID_GENERATOR, UuidGeneratorService } from '../../services/idgen.service.js'
import { OrderRepositoryModule, ProductRepositoryModule, PromotionRepositoryModule } from '../../repositories/mysql/index.js'
import { FEATURE_ORDER, OrderFeature } from './order.feature.js'
import { OrderController as RestOrderController } from './order.restcontroller.js'
import { OrderEventHandler } from './order.eventhandler.js';
import { InventoryModule } from '../../services/inventory.module.js';
import { SERVICE_EVENT_TOKEN } from '../../services/event/event.js';

@Module({
  imports: [
    OrderRepositoryModule,
    ProductRepositoryModule,
    PromotionRepositoryModule,
    InventoryModule,
  ],
  providers: [
    ConfigService,
    {
      provide: SERVICE_EVENT_TOKEN,
      useClass: RedisStreamClient,
    },
    {
      provide: SERVICE_ID_GENERATOR,
      useClass: UuidGeneratorService,
    },
    {
      provide: FEATURE_ORDER,
      useClass: OrderFeature,
    },
  ],
  controllers: [
    RestOrderController,
    OrderEventHandler,
  ],
  exports: []
})
export class OrderModule { }