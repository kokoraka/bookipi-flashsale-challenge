import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Status, StatusCode } from '../../entities/status/index.js'
import { Promotion } from '../../entities/promotion/Promotion.js';
import type { ProductRepositoryInterface } from '../../repositories/repository.js'
import { REPOSITORY_PRODUCT_TOKEN } from '../../repositories/repository.js'
import { FileObject } from './../file/file.js'

export interface FlashSaleFeatureInterface {
  getProduct(p: GetProductParam): Promise<GetProductResult>
  getPromotion(p: GetPromotionParam): Promise<GetPromotionResult>
}

export type GetProductParam = {
  unique_id: string
}

export type GetProductResult = {
  status: Status
  product?: GetProductItem
}

type GetProductItem = {
  unique_id: string
  name: string
  description?: string
  thumbnail?: FileObject
  selling_price: number
  created_at: Date
  updated_at?: Date
}

export type GetPromotionParam = {
  unique_id: string
}

export type GetPromotionResult = {
  status: Status
  promotion?: GetPromotionItem
  promotion_state?: string
}

type GetPromotionItem = {
  unique_id: string
  start_at: Date
  end_at: Date
}

@Injectable()
export class FlashSaleFeature implements FlashSaleFeatureInterface {
  constructor(
    private readonly configService: ConfigService,
    @Inject(REPOSITORY_PRODUCT_TOKEN)
    private readonly productRepo: ProductRepositoryInterface
  ) { }

  async getProduct(p: GetProductParam): Promise<GetProductResult> {
    try {
      return await this.productRepo.getProduct({
        unique_id: p.unique_id,
      });
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }

  async getPromotion(p: GetPromotionParam): Promise<GetPromotionResult> {
    try {
      const currentTs = new Date()
      const isPromotionEnabled = this.configService.get<boolean>('PROMOTION_ENABLED') ?? false
      const promotionId = this.configService.get<string>('PROMOTION_ID') ?? ''
      const promotionStartTime = new Date(parseInt(this.configService.get<string>('PROMOTION_START_TIME') ?? '0'))
      const promotionEndTime = new Date(parseInt(this.configService.get<string>('PROMOTION_END_TIME') ?? '0'))
      const promotion = new Promotion(isPromotionEnabled, promotionStartTime, promotionEndTime, currentTs)
      if (p.unique_id != promotionId || !promotion.valid()) {
        return {
          status: new Status(StatusCode.RESOURCE_NOT_FOUND, 'promotion not found'),
        };
      }

      return Promise.resolve({
        status: new Status(StatusCode.SUCCESS, 'success get promotion'),
        promotion: {
          unique_id: promotionId,
          start_at: promotionStartTime,
          end_at: promotionEndTime,
        },
        promotion_state: promotion.getStateCode().toString()
      })
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }
}
