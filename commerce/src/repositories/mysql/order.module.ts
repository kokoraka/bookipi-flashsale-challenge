import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderRepository } from './order.repository.js'
import { REPOSITORY_ORDER_TOKEN } from '../repository.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'primary'),
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