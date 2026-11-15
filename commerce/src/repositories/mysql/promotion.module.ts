import { Module } from '@nestjs/common'
import { PromotionRepository } from './promotion.repository.js'
import { REPOSITORY_PROMOTION_TOKEN } from '../repository.js'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [],
  providers: [
    ConfigService,
    PromotionRepository,
    {
      provide: REPOSITORY_PROMOTION_TOKEN,
      useExisting: PromotionRepository
    }
  ],
  exports: [
    REPOSITORY_PROMOTION_TOKEN
  ]
})
export class PromotionRepositoryModule { }