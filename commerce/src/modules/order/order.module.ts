import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { SERVICE_ID_GENERATOR, UuidGeneratorService } from '../../services/idgen.service.js'
import { OrderRepositoryModule, ProductRepositoryModule, PromotionRepositoryModule } from '../../repositories/mysql/index.js'
import { OrderFeature } from './order.feature.js'
import { OrderController as RestOrderController } from './order.restcontroller.js'

@Module({
  imports: [
    OrderRepositoryModule,
    ProductRepositoryModule,
    PromotionRepositoryModule,
  ],
  providers: [
    {
      provide: SERVICE_ID_GENERATOR,
      useClass: UuidGeneratorService,
    },
    ConfigService,
    OrderFeature,
  ],
  controllers: [
    RestOrderController,
  ],
  exports: [
    SERVICE_ID_GENERATOR,
    OrderFeature
  ]
})
export class OrderModule { }