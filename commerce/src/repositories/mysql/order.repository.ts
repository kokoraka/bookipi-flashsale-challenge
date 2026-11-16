
import {
  OrderRepositoryInterface,
  QueryOption,
  CreateOrderParam,
  CreateOrderResult,
  GetOrderParam,
  GetOrderResult,
} from '../repository.js';
import { parseQueryOption } from '../query.js';
import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { Product } from '../../models/product.model.js';
import { Order } from '../../models/order.model.js';
import { OrderItem } from '../../models/order_item.model.js';
import { Status } from '../../entities/status/Status.js';
import { StatusCode } from '../../entities/status/StatusCode.js';

@Injectable()
export class OrderRepository implements OrderRepositoryInterface {

  constructor(
    @Inject(CACHE_MANAGER) private repoCache: Cache,
    @InjectDataSource('primary')
    private readonly primarySource: DataSource,
    @InjectDataSource('secondary')
    private readonly secondarySource: DataSource
  ) { }

  async createOrder(p: CreateOrderParam): Promise<CreateOrderResult> {
    try {

      const trxRes = await this.primarySource.transaction(async (manager) => {
        const createRes = await manager
          .createQueryBuilder()
          .insert()
          .into(Order)
          .values({
            idempotency_key: p.idempotency_key,
            unique_id: p.unique_id,
            promotion_key: p.promotion_key,
            buyer_email: p.buyer_email,
            buyer_name: p.buyer_name,
            buyer_snapshot: p.buyer_snapshot,
            grand_total: p.grand_total,
            status: p.status,
            placed_at: p.placed_at,
            created_at: p.created_at,
          })
          .orIgnore()
          .updateEntity(false)
          .execute();
        if (createRes.raw.affectedRows === 0) {
          const order = await manager.findOne(Order, {
            where: {
              idempotency_key: p.idempotency_key,
            },
          });
          if (!order) {
            throw new Status(StatusCode.VALIDATION_INVALID_STATE, 'failed create order')
          }
          return {
            exists: true,
            order: order
          }
        }

        const order = await manager.findOne(Order, {
          where: {
            unique_id: p.unique_id,
          },
        });
        if (!order) {
          throw new Status(StatusCode.VALIDATION_INVALID_STATE, 'failed find order')
        }

        const product = await manager.findOne(Product, {
          where: {
            unique_id: p.item.product_id,
          },
        });
        if (!product) {
          throw new Status(StatusCode.VALIDATION_INVALID_STATE, 'failed find product')
        }

        const decRes = await manager.decrement(
          Product,
          {
            unique_id: p.item.product_id,
            available_quantity: MoreThanOrEqual(p.item.quantity),
          },
          'available_quantity',
          p.item.quantity,
        );
        if (decRes.affected === 0) {
          throw new Status(
            StatusCode.VALIDATION_INVALID_STATE,
            'insufficient product stock',
          );
        }

        const item = manager.create(OrderItem, {
          order_id: order.id,
          unique_id: p.item.unique_id,
          name: p.item.name,
          description: p.item.description,
          quantity: p.item.quantity,
          unit_price: p.item.unit_price,
          product_id: product.id,
          product_snapshot: p.item.product_snapshot,
          created_at: order.created_at,
          updated_at: order.updated_at,
        });
        await manager.save(OrderItem, item);

        return {
          exists: false,
          order: order,
        }
      });
      if (!trxRes) {
        return {
          status: new Status(StatusCode.SYSTEM_INTERNAL_ERROR, 'failed create order'),
        };
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success create order'),
        order: {
          exists: trxRes.exists,
          unique_id: trxRes.order.unique_id,
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }

  async getOrder(p: GetOrderParam, opts?: QueryOption): Promise<GetOrderResult> {
    try {
      const {
        readCache,
        writeCache,
        cacheTtl,
        cachePrefix,
      } = parseQueryOption(opts)

      const lookupKey = `${cachePrefix ? `${cachePrefix}:` : 'order:'}${p.unique_id}`
      if (readCache) {
        const cachedValue = await this.repoCache.get<Order>(lookupKey)
        if (cachedValue) {
          const order = Object.assign(new Order(), cachedValue)
          return {
            status: new Status(StatusCode.SUCCESS, 'success get order'),
            order: {
              unique_id: order.unique_id,
              buyer_email: order.buyer_email,
              buyer_name: order.buyer_name,
              status: order.status,
              grand_total: order.grand_total,
              placed_at: new Date(order.placed_at),
              created_at: new Date(order.created_at),
              updated_at: order.updated_at ? new Date(order.updated_at) : undefined,
              items: order.items.map((item) => {
                return {
                  unique_id: item.unique_id,
                  name: item.name,
                  description: item.description,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                }
              })
            }
          };
        }
      }

      const order = await this.secondarySource.getRepository(Order)
        .createQueryBuilder('orders')
        .leftJoinAndSelect('orders.items', 'orderItems')
        .select([
          'orders.id',
          'orders.unique_id',
          'orders.idempotency_key',
          'orders.buyer_email',
          'orders.buyer_name',
          'orders.buyer_snapshot',
          'orders.promotion_key',
          'orders.status',
          'orders.grand_total',
          'orders.placed_at',
          'orders.created_at',
          'orders.updated_at',

          'orderItems.id',
          'orderItems.order_id',
          'orderItems.unique_id',
          'orderItems.name',
          'orderItems.description',
          'orderItems.quantity',
          'orderItems.unit_price',
          'orderItems.product_id',
          'orderItems.product_snapshot',
          'orderItems.created_at',
          'orderItems.updated_at',
        ])
        .where('orders.unique_id = :unique_id', {
          unique_id: p.unique_id
        })
        .getOne();
      if (!order) {
        return {
          status: new Status(StatusCode.RESOURCE_NOT_FOUND, 'order not found'),
        };
      }

      if (writeCache) {
        await this.repoCache.set(lookupKey, order, cacheTtl);
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success get order'),
        order: {
          unique_id: order.unique_id,
          buyer_email: order.buyer_email,
          buyer_name: order.buyer_name,
          status: order.status,
          grand_total: order.grand_total,
          placed_at: order.placed_at,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: order.items.map((item) => {
            return {
              unique_id: item.unique_id,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }
          })
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
