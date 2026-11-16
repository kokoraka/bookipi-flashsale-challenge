import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { OrderRepository } from './order.repository.js'
import { REPOSITORY_ORDER_TOKEN } from '../repository.js'

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([], 'primary'),
    TypeOrmModule.forFeature([], 'secondary'),
  ],
  providers: [
    OrderRepository,
    {
      provide: REPOSITORY_ORDER_TOKEN,
      useExisting: OrderRepository
    }
  ],
  exports: [
    REPOSITORY_ORDER_TOKEN
  ]
})
export class OrderRepositoryModule { }