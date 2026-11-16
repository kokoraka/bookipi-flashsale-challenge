import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductRepository } from './product.repository.js'
import { REPOSITORY_PRODUCT_TOKEN } from './../repository.js'

@Module({
  imports: [
    CacheModule.register(),
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