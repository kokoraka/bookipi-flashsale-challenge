import { Controller, HttpStatus, Post, Body, Headers, Res, Get, Param, Inject } from '@nestjs/common';
import type { Response } from 'express';
import { StatusCode } from '../../entities/status/StatusCode.js';
import { FEATURE_ORDER } from './order.feature.js';
import type { OrderFeatureInterface } from './order.feature.js';
import { PlaceOrderRequest } from '../../restgen/models/PlaceOrderRequest.js'
import { PlaceOrderResponse } from '../../restgen/models/PlaceOrderResponse.js'
import { GetOrderByIdResponse } from '../../restgen/index.js';

@Controller()
export class OrderController {
  constructor(
    @Inject(FEATURE_ORDER)
    private readonly orderFeature: OrderFeatureInterface,
  ) { }

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
      promotion_id: body?.promotion_id,
    })
    if (!placeRes.status.valid() || !placeRes.order) {
      let httpCode = HttpStatus.INTERNAL_SERVER_ERROR
      if (placeRes.status.is(StatusCode.VALIDATION_INVALID_PARAM)) {
        httpCode = HttpStatus.BAD_REQUEST
      } else if (placeRes.status.is(StatusCode.VALIDATION_INVALID_STATE)) {
        httpCode = HttpStatus.CONFLICT
      }
      res.status(httpCode)
      return {
        status: {
          code: placeRes.status.code,
          message: placeRes.status.message
        },
      }
    }

    let httpCode = HttpStatus.ACCEPTED
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

  @Get('/v1/orders/:id')
  async getOrder(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GetOrderByIdResponse> {
    const getRes = await this.orderFeature.getOrder({
      unique_id: id,
    })
    if (!getRes.status.valid() || !getRes.order) {
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
        order: {
          unique_id: getRes.order.unique_id,
          buyer_email: getRes.order.buyer_email,
          buyer_name: getRes.order.buyer_name,
          grand_total: getRes.order.grand_total.toString(),
          status: getRes.order.status,
          placed_at: getRes.order.placed_at.getTime(),
          created_at: getRes.order.created_at.getTime(),
          updated_at: getRes.order.updated_at?.getTime(),
          items: getRes.order.items.map((item) => {
            return {
              unique_id: item.unique_id,
              name: item.name,
              description: item.description,
              quantity: item.quantity.toString(),
              unit_price: item.unit_price.toString(),
            }
          }),
        }
      }
    }
  }
}
