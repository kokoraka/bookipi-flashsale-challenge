import { Injectable, Inject } from '@nestjs/common';
import { Status } from '../../entities/status/index.js'
import type { ProductRepositoryInterface } from '../../repositories/repository.js'
import { REPOSITORY_PRODUCT_TOKEN } from '../../repositories/repository.js'
import { FileObject } from './../file/file.js'

export interface FlashSaleFeatureInterface {
  getProduct(p: GetProductParam): Promise<GetProductResult>
}

export type GetProductParam = {
  unique_id: string
}

export type GetProductResult = {
  status: Status
  product?: GetProductItem
}

export type GetProductItem = {
  unique_id: string
  name: string
  description?: string
  thumbnail?: FileObject
  selling_price: number
  created_at: Date
  updated_at?: Date
}

@Injectable()
export class FlashSaleFeature implements FlashSaleFeatureInterface {
  constructor(
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
}
