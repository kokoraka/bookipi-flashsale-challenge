import { Controller, Get, Param } from '@nestjs/common';
import { FlashSaleFeature } from './flashsale.feature.js';
import { GetFlashsaleProductByIdResponse } from './../../restgen/models/GetFlashsaleProductByIdResponse.js'

@Controller()
export class FlashSaleController {
  constructor(private readonly flashSaleFeature: FlashSaleFeature) { }

  @Get('/v1/flashsale/products/:id')
  async getProduct(@Param('id') id: string): Promise<GetFlashsaleProductByIdResponse> {
    const getRes = await this.flashSaleFeature.getProduct({
      unique_id: id,
    })
    if (!getRes.status.valid() || !getRes.product) {
      return {
        status: {
          code: getRes.status.code,
          message: getRes.status.message
        },
      }
    }

    return {
      status: {
        code: getRes.status.code,
        message: getRes.status.message
      },
      data: {
        product: {
          unique_id: getRes.product?.unique_id,
          name: getRes.product?.name,
          created_at: getRes.product?.created_at.getTime(),
          updated_at: getRes.product?.updated_at?.getTime(),
        }
      }
    }
  }
}
