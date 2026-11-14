import { Module } from '@nestjs/common'
import { ProductRepository } from './product.repository.js'
import { REPOSITORY_PRODUCT_TOKEN } from './../token.js'

@Module({
  providers: [
    ProductRepository,
    {
      provide: REPOSITORY_PRODUCT_TOKEN,
      useExisting: ProductRepository
    }
  ],
  exports: [
    REPOSITORY_PRODUCT_TOKEN
  ]
})
export class ProductRepositoryModule { }