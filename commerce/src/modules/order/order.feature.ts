import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as z from 'zod';
import { Status, StatusCode } from '../../entities/status/index.js'
import { SERVICE_ID_GENERATOR } from '../../services/idgen.service.js'
import type { IdGeneratorInterface } from '../../services/idgen.service.js'
import type { OrderRepositoryInterface, ProductRepositoryInterface } from '../../repositories/repository.js'
import { REPOSITORY_ORDER_TOKEN, REPOSITORY_PRODUCT_TOKEN } from '../../repositories/repository.js'
import { OrderStatus } from './../../entities/order/OrderStatus.js'
import { } from '../../repositories/repository.js'
import { Promotion, PromotionState } from '../../entities/promotion/Promotion.js';

export interface OrderFeatureInterface {
  placeOrder(p: PlaceOrderParam): Promise<PlaceOrderResult>
  getOrder(p: GetOrderParam): Promise<GetOrderResult>
}

export type PlaceOrderParam = {
  idempotency_key?: string
  name?: string
  email?: string
  item_id?: string
  quantity?: string
}

export type PlaceOrderResult = {
  status: Status
  order?: PlaceOrderItem
}

type PlaceOrderItem = {
  exists: boolean
  unique_id: string
}

export type GetOrderParam = {
  unique_id: string
}

export type GetOrderResult = {
  status: Status
  order?: GetOrderInfo
}

type GetOrderInfo = {
  unique_id: string
  buyer_name: string
  buyer_email: string
  status: string
  grand_total: number
  placed_at: Date
  created_at: Date
  updated_at?: Date
  items: GetOrderItem[]
}

type GetOrderItem = {
  unique_id: string
  name: string
  description?: string
  quantity: number
  unit_price: number
}

@Injectable()
export class OrderFeature implements OrderFeatureInterface {
  constructor(
    private readonly configService: ConfigService,
    @Inject(SERVICE_ID_GENERATOR)
    private readonly idGenerator: IdGeneratorInterface,
    @Inject(REPOSITORY_ORDER_TOKEN)
    private readonly orderRepo: OrderRepositoryInterface,
    @Inject(REPOSITORY_PRODUCT_TOKEN)
    private readonly productRepo: ProductRepositoryInterface
  ) { }

  async placeOrder(p: PlaceOrderParam): Promise<PlaceOrderResult> {
    try {
      const currentTs = new Date()
      const isPromotionEnabled = this.configService.get<boolean>('PROMOTION_ENABLED') ?? false
      const promotionId = this.configService.get<string>('PROMOTION_ID')
      const promotionStartTime = new Date(parseInt(this.configService.get<string>('PROMOTION_START_TIME') ?? '0'))
      const promotionEndTime = new Date(parseInt(this.configService.get<string>('PROMOTION_END_TIME') ?? '0'))
      const promotion = new Promotion(isPromotionEnabled, promotionStartTime, promotionEndTime, currentTs)
      if (!promotion.isState(PromotionState.ONGOING)) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_STATE, promotion.getStateMessage())
        };
      }

      const validationRule = z.object({
        idempotency_key: z.string().trim().min(1).max(36),
        name: z.string().trim().min(1).max(128),
        email: z.email().trim().min(3).max(188).toLowerCase(),
        item_id: z.string().trim().min(1).max(64),
        quantity: z.coerce.number().min(1).max(1, 'can only purchase 1 quantity at the moment'),
      });
      const validateRes = await validationRule.safeParseAsync(p);
      if (!validateRes.success) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'invalid parameter')
        }
      }

      const getProduct = await this.productRepo.getProduct({
        unique_id: validateRes.data.item_id,
      })
      if (!getProduct.status.is(StatusCode.SUCCESS) || !getProduct.product) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'product not found')
        }
      }

      const genIds = this.idGenerator.generateIds(2)
      if (!genIds.status.is(StatusCode.SUCCESS) || !genIds.ids) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'failed generate id')
        }
      }

      const createRes = await this.orderRepo.createOrder({
        idempotency_key: validateRes.data.idempotency_key,
        unique_id: genIds?.ids[0].text,
        promotion_key: promotionId,
        buyer_email: validateRes.data.email,
        buyer_name: validateRes.data.name,
        status: OrderStatus.PENDING,
        grand_total: getProduct.product.selling_price,
        item: {
          unique_id: genIds?.ids[1].text,
          name: getProduct.product.name,
          description: getProduct.product.description,
          product_id: getProduct.product.unique_id,
          quantity: validateRes.data.quantity,
          unit_price: getProduct.product.selling_price,
        },
        placed_at: currentTs,
        created_at: currentTs,
      })
      if (!createRes.status.is(StatusCode.SUCCESS) || !createRes.order) {
        return {
          status: createRes.status,
        }
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success place order'),
        order: {
          exists: createRes.order.exists,
          unique_id: createRes.order.unique_id,
        }
      }
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }

  async getOrder(p: GetOrderParam): Promise<GetOrderResult> {
    try {
      return await this.orderRepo.getOrder({
        unique_id: p.unique_id,
      });
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }
}
