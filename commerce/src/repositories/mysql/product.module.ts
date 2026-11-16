import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './product.repository.js'
import { REPOSITORY_PRODUCT_TOKEN } from './../repository.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'secondary'),
  ],
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