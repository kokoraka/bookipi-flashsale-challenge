import { lastValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as z from 'zod';
import { Status, StatusCode } from '../../entities/status/index.js'
import { Promotion, PromotionState } from '../../entities/promotion/Promotion.js';
import { OrderStatus } from '../../entities/order/OrderStatus.js';
import { SERVICE_ID_GENERATOR } from '../../services/idgen.service.js'
import type { IdGeneratorInterface } from '../../services/idgen.service.js'
import type { OrderRepositoryInterface, ProductRepositoryInterface, PromotionRepositoryInterface } from '../../repositories/repository.js'
import { REPOSITORY_ORDER_TOKEN, REPOSITORY_PRODUCT_TOKEN, REPOSITORY_PROMOTION_TOKEN } from '../../repositories/repository.js'
import { SERVICE_INVENTORY_TOKEN, ReserveStockCode } from '../../services/inventory.service.js';
import type { InventoryServiceInterface } from '../../services/inventory.service.js'
import { SERVICE_EVENT_TOKEN } from '../../services/event/event.js';
import { OrderPlacedMessage } from './order.event.js';

export const FEATURE_ORDER = Symbol('FEATURE_ORDER');
export const EVENT_ORDER_PLACED = 'order.placed'
const MAX_ORDER_PER_IDENTIFIER = 1

export interface OrderFeatureInterface {
  placeOrder(p: PlaceOrderParam): Promise<PlaceOrderResult>
  getOrder(p: GetOrderParam): Promise<GetOrderResult>
  createOrder(p: CreateOrderParam): Promise<CreateOrderResult>
}

export type PlaceOrderParam = {
  idempotency_key?: string
  name?: string
  email?: string
  item_id?: string
  quantity?: string
  promotion_id?: string
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

export type CreateOrderParam = {
  idempotency_key: string
  promotion_key: string
  order_id: string
  buyer_email: string
  buyer_name: string
  item_id: string
  item_quantity: number
  item_name: string
  item_description: string
  item_unit_price: number
  placed_at: Date
}

export type CreateOrderResult = {
  status: Status
  order?: CreateOrderItem
}

type CreateOrderItem = {
  unique_id: string
  created_at: Date
}

@Injectable()
export class OrderFeature implements OrderFeatureInterface {
  constructor(
    @Inject(SERVICE_ID_GENERATOR)
    private readonly idGenerator: IdGeneratorInterface,
    @Inject(REPOSITORY_ORDER_TOKEN)
    private readonly orderRepo: OrderRepositoryInterface,
    @Inject(REPOSITORY_PRODUCT_TOKEN)
    private readonly productRepo: ProductRepositoryInterface,
    @Inject(REPOSITORY_PROMOTION_TOKEN)
    private readonly promotionRepo: PromotionRepositoryInterface,
    @Inject(SERVICE_INVENTORY_TOKEN)
    private readonly inventoryService: InventoryServiceInterface,
    @Inject(SERVICE_EVENT_TOKEN) private readonly eventClient: ClientProxy,
  ) { }

  async placeOrder(p: PlaceOrderParam): Promise<PlaceOrderResult> {
    try {
      const validationRule = z.object({
        idempotency_key: z.string().trim().min(1).max(36),
        promotion_id: z.string().trim().min(1).max(36),
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

      const getPromotion = await this.promotionRepo.getPromotion({
        unique_id: validateRes.data.promotion_id
      })
      if (!getPromotion.status.is(StatusCode.SUCCESS) || !getPromotion.promotion) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'promotion not found')
        }
      }

      const currentTs = new Date()
      const promotion = new Promotion(getPromotion.promotion.is_enabled, getPromotion.promotion.start_at, getPromotion.promotion.end_at, currentTs)
      if (!promotion.isState(PromotionState.ONGOING)) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_STATE, promotion.getStateMessage())
        };
      }

      const getProduct = await this.productRepo.getProduct({
        unique_id: validateRes.data.item_id,
      }, {
        readCache: true,
      })
      if (!getProduct.status.is(StatusCode.SUCCESS) || !getProduct.product) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'product not found')
        }
      }

      const genIds = this.idGenerator.generateIds(1)
      if (!genIds.status.is(StatusCode.SUCCESS) || !genIds.ids) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'failed generate id')
        }
      }

      const orderId = genIds?.ids[0].text

      const reserveRes = await this.inventoryService.reserveStock({
        inventory_key: `inventory:${validateRes.data.item_id}`,
        identifier_key: `order:${validateRes.data.item_id}`,
        identifier_id: validateRes.data.email,
        identifier_limit: `${MAX_ORDER_PER_IDENTIFIER}`,
      })
      if (reserveRes.code != ReserveStockCode.RESERVE_SUCCESS) {
        switch (reserveRes.code) {
          case ReserveStockCode.RESERVE_OUT_OF_STOCK:
            return {
              status: new Status(StatusCode.VALIDATION_INVALID_STATE, 'insufficient product stock'),
            }
          case ReserveStockCode.RESERVE_LIMIT_REACHED:
            return {
              status: new Status(StatusCode.VALIDATION_INVALID_STATE, `unable to order more than ${MAX_ORDER_PER_IDENTIFIER}`),
            }
          default:
            return {
              status: new Status(StatusCode.VALIDATION_INVALID_STATE, 'unable to reserve order'),
            }
        }
      }

      await lastValueFrom(
        this.eventClient.emit(EVENT_ORDER_PLACED, {
          idempotency_key: validateRes.data.idempotency_key,
          promotion_key: p.promotion_id,
          order_id: orderId,
          buyer_email: validateRes.data.email,
          buyer_name: validateRes.data.name,
          item_id: validateRes.data.item_id,
          item_quantity: validateRes.data.quantity,
          item_name: getProduct.product.name,
          item_description: getProduct.product.description,
          item_unit_price: getProduct.product.selling_price,
          placed_at: currentTs.getTime(),
        } as OrderPlacedMessage)
      )

      return {
        status: new Status(StatusCode.SUCCESS, 'success place order'),
        order: {
          exists: false,
          unique_id: orderId,
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
      }, {
        readCache: true,
        writeCache: true,
        cachePrefix: `order-detail`,
      });
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }

  async createOrder(p: CreateOrderParam): Promise<CreateOrderResult> {
    try {
      const validationRule = z.object({
        idempotency_key: z.string().trim().min(1).max(36),
        promotion_key: z.string().trim().min(1).max(36),
        order_id: z.string().trim().min(1).max(36),
        buyer_email: z.email().trim().min(3).max(188).toLowerCase(),
        buyer_name: z.string().trim().min(1).max(128),
        item_id: z.string().trim().min(1).max(64),
        item_name: z.string().trim().min(1).max(128),
        item_description: z.string().trim(),
        item_unit_price: z.coerce.number(),
        item_quantity: z.coerce.number().min(1).max(1, 'can only purchase 1 quantity at the moment'),
        placed_at: z.date(),
      });
      const validateRes = await validationRule.safeParseAsync(p);
      if (!validateRes.success) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'invalid parameter')
        }
      }

      const getProduct = await this.productRepo.getProduct({
        unique_id: p.item_id,
      })
      if (!getProduct.status.is(StatusCode.SUCCESS) || !getProduct.product) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'product not found')
        }
      }

      const genIds = this.idGenerator.generateIds(1)
      if (!genIds.status.is(StatusCode.SUCCESS) || !genIds.ids) {
        return {
          status: new Status(StatusCode.VALIDATION_INVALID_PARAM, 'failed generate id')
        }
      }

      const currentTs = new Date()
      const itemId = genIds.ids[0].text

      const createRes = await this.orderRepo.createOrder({
        idempotency_key: validateRes.data.idempotency_key,
        unique_id: validateRes.data.order_id,
        promotion_key: validateRes.data.promotion_key,
        buyer_email: validateRes.data.buyer_email,
        buyer_name: validateRes.data.buyer_name,
        status: OrderStatus.PENDING,
        grand_total: validateRes.data.item_unit_price,
        item: {
          unique_id: itemId,
          name: validateRes.data.item_name,
          description: validateRes.data.item_description,
          product_id: validateRes.data.item_id,
          unit_price: validateRes.data.item_unit_price,
          quantity: validateRes.data.item_quantity,
        },
        placed_at: validateRes.data.placed_at,
        created_at: currentTs,
      })
      if (!createRes.status.is(StatusCode.SUCCESS) || !createRes.order) {
        return {
          status: createRes.status,
        }
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success create order'),
        order: {
          unique_id: createRes.order.unique_id,
          created_at: createRes.order.created_at,
        }
      }
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      }
    }
  }
}
