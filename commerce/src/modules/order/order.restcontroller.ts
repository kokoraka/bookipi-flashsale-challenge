import { Controller, HttpStatus, Post, Body, Headers, Res, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { StatusCode } from '../../entities/status/StatusCode.js';
import { OrderFeature } from './order.feature.js';
import { PlaceOrderRequest } from '../../restgen/models/PlaceOrderRequest.js'
import { PlaceOrderResponse } from '../../restgen/models/PlaceOrderResponse.js'

@Controller()
export class OrderController {
  constructor(private readonly orderFeature: OrderFeature) { }

  @Post('/v1/orders')
  async placeOrder(
    @Res({ passthrough: true }) res: Response,
    @Body() body?: PlaceOrderRequest,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ): Promise<PlaceOrderResponse> {
    const placeRes = await this.orderFeature.placeOrder({
      idempotency_key: idempotencyKey,
      email: body?.email,
      name: body?.name,
      item_id: body?.item_id,
      quantity: body?.quantity,
    })
    if (!placeRes.status.valid() || !placeRes.order) {
      let httpCode = HttpStatus.INTERNAL_SERVER_ERROR
      if (placeRes.status.any([StatusCode.VALIDATION_INVALID_PARAM, StatusCode.VALIDATION_INVALID_STATE])) {
        httpCode = HttpStatus.BAD_REQUEST
      } else if (placeRes.status.is(StatusCode.AUTHZ_FORBIDDEN)) {
        httpCode = HttpStatus.FORBIDDEN
      }
      res.status(httpCode)
      return {
        status: {
          code: placeRes.status.code,
          message: placeRes.status.message
        },
      }
    }

    let httpCode = HttpStatus.CREATED
    if (placeRes.order.exists) {
      httpCode = HttpStatus.OK
    }

    res.status(httpCode)
    return {
      status: {
        code: placeRes.status.code,
        message: placeRes.status.message
      },
      data: {
        order: {
          unique_id: placeRes.order.unique_id
        }
      }
    }
  }
}
