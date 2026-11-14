import { Controller, HttpStatus, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { StatusCode } from './../../entities/status/StatusCode.js';
import { FlashSaleFeature } from './flashsale.feature.js';
import { GetFlashsaleProductByIdResponse } from '../../restgen/models/GetFlashsaleProductByIdResponse.js'

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
    if (!getRes.status.valid() || !getRes.product) {
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
        }
      }
    }
  }
}
