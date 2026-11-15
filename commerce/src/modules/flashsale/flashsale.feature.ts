import { Injectable, Inject } from '@nestjs/common';
import { Status, StatusCode } from '../../entities/status/index.js'
import { Promotion } from '../../entities/promotion/Promotion.js';
import type { ProductRepositoryInterface, PromotionRepositoryInterface } from '../../repositories/repository.js'
import { REPOSITORY_PRODUCT_TOKEN, REPOSITORY_PROMOTION_TOKEN } from '../../repositories/repository.js'
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
    @Inject(REPOSITORY_PRODUCT_TOKEN)
    private readonly productRepo: ProductRepositoryInterface,
    @Inject(REPOSITORY_PROMOTION_TOKEN)
    private readonly promotionRepo: PromotionRepositoryInterface
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
      const getRes = await this.promotionRepo.getPromotion({
        unique_id: p.unique_id
      })
      if (!getRes.status.is(StatusCode.SUCCESS) || !getRes.promotion) {
        return {
          status: getRes.status
        }
      }

      const currentTs = new Date()
      const promotion = new Promotion(getRes.promotion.is_enabled, getRes.promotion?.start_at, getRes.promotion.end_at, currentTs)

      return Promise.resolve({
        status: new Status(StatusCode.SUCCESS, 'success get promotion'),
        promotion: {
          unique_id: getRes.promotion.unique_id,
          start_at: getRes.promotion.start_at,
          end_at: getRes.promotion.end_at,
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
