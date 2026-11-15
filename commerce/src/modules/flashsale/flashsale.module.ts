import { Module } from '@nestjs/common'
import { FlashSaleFeature } from './flashsale.feature.js'
import { FlashSaleController as RestFlashSaleController } from './flashsale.restcontroller.js'
import { ProductRepositoryModule } from './../../repositories/mysql/index.js'

@Module({
  imports: [
    ProductRepositoryModule,
  ],
  providers: [
    FlashSaleFeature,
  ],
  controllers: [
    RestFlashSaleController,
  ],
  exports: [
    FlashSaleFeature
  ]
})
export class FlashSaleModule { }