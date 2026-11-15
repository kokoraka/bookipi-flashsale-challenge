import { Controller, HttpStatus, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { StatusCode } from './../../entities/status/StatusCode.js';
import { FlashSaleFeature } from './flashsale.feature.js';
import { GetFlashsaleProductByIdResponse } from '../../restgen/models/GetFlashsaleProductByIdResponse.js'
import { GetFlashsalePromotionByIdResponse } from '../../restgen/index.js';

@Controller()
export class FlashSaleController {
  constructor(private readonly flashSaleFeature: FlashSaleFeature) { }

  @Get('/v1/flashsale/products/:id')
  async getProduct(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GetFlashsaleProductByIdResponse> {
    const getRes = await this.flashSaleFeature.getProduct({
      unique_id: id,
    })
    if (!getRes.status.valid() || !getRes.product || !getRes.inventory) {
      let httpCode = HttpStatus.INTERNAL_SERVER_ERROR
      if (getRes.status.is(StatusCode.RESOURCE_NOT_FOUND)) {
        httpCode = HttpStatus.NOT_FOUND
      }
      res.status(httpCode)
      return {
        status: {
          code: getRes.status.code,
          message: getRes.status.message
        },
      }
    }

    res.status(HttpStatus.OK)
    return {
      status: {
        code: getRes.status.code,
        message: getRes.status.message
      },
      data: {
        product: {
          unique_id: getRes.product.unique_id,
          name: getRes.product.name,
          description: getRes.product.description,
          selling_price: getRes.product.selling_price.toString(),
          thumbnail: getRes.product.thumbnail,
          created_at: getRes.product.created_at.getTime(),
          updated_at: getRes.product.updated_at?.getTime(),
        },
        inventory: {
          available_quantity: getRes.inventory.available_quantity.toString(),
        }
      }
    }
  }

  @Get('/v1/flashsale/promotions/:id')
  async getPromotion(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GetFlashsalePromotionByIdResponse> {
    const getRes = await this.flashSaleFeature.getPromotion({
      unique_id: id,
    })
    if (!getRes.status.valid() || !getRes.promotion || !getRes.promotion_state) {
      let httpCode = HttpStatus.INTERNAL_SERVER_ERROR
      if (getRes.status.is(StatusCode.RESOURCE_NOT_FOUND)) {
        httpCode = HttpStatus.NOT_FOUND
      }
      res.status(httpCode)
      return {
        status: {
          code: getRes.status.code,
          message: getRes.status.message
        },
      }
    }

    res.status(HttpStatus.OK)
    return {
      status: {
        code: getRes.status.code,
        message: getRes.status.message
      },
      data: {
        promotion: {
          unique_id: getRes.promotion.unique_id,
          start_at: getRes.promotion.start_at.getTime(),
          end_at: getRes.promotion.end_at.getTime(),
        },
        promotion_state: getRes.promotion_state
      }
    }
  }
}
