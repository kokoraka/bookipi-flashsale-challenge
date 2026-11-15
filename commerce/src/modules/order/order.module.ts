import { Module } from '@nestjs/common'
import { SERVICE_ID_GENERATOR, UuidGeneratorService } from '../../services/idgen.service.js'
import { OrderRepositoryModule, ProductRepositoryModule } from '../../repositories/mysql/index.js'
import { OrderFeature } from './order.feature.js'
import { OrderController as RestOrderController } from './order.restcontroller.js'

@Module({
  imports: [
    OrderRepositoryModule,
    ProductRepositoryModule,
  ],
  providers: [
    {
      provide: SERVICE_ID_GENERATOR,
      useClass: UuidGeneratorService,
    },
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