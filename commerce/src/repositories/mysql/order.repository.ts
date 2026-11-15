
import {
  OrderRepositoryInterface,
  CreateOrderParam,
  CreateOrderResult,
} from '../repository.js';
import { Injectable } from '@nestjs/common';
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
    @InjectDataSource('primary')
    private readonly primarySource: DataSource
  ) { }

  async createOrder(p: CreateOrderParam): Promise<CreateOrderResult> {
    try {

      const trxRes = await this.primarySource.transaction(async (manager) => {
        const checkOrder = await manager.findOne(Order, {
          where: {
            idempotency_key: p.idempotency_key
          }
        })
        if (checkOrder) {
          return {
            exists: true,
            order: checkOrder
          }
        }

        const product = await manager.findOne(Product, {
          where: {
            unique_id: p.item.product_id,
            available_quantity: MoreThanOrEqual(p.item.quantity),
          },
          lock: {
            mode: 'pessimistic_write'
          }
        });
        if (!product) {
          return new Status(StatusCode.VALIDATION_INVALID_STATE, 'unsufficient product stock')
        }

        await manager.decrement(
          Product, { id: product.id },
          'available_quantity', p.item.quantity,
        );

        const order = manager.create(Order, {
          idempotency_key: p.idempotency_key,
          unique_id: p.unique_id,
          buyer_email: p.buyer_email,
          buyer_name: p.buyer_name,
          buyer_snapshot: p.buyer_snapshot,
          grand_total: p.grand_total,
          status: p.status,
          placed_at: p.placed_at,
          created_at: p.created_at,
        });
        const savedOrder = await manager.save(Order, order);

        const item = manager.create(OrderItem, {
          order_id: savedOrder.id,
          unique_id: p.item.unique_id,
          name: p.item.name,
          description: p.item.description,
          quantity: p.item.quantity,
          unit_price: p.item.unit_price,
          product_id: product.id,
          product_snapshot: p.item.product_snapshot,
          created_at: savedOrder.created_at,
          updated_at: savedOrder.updated_at,
        });
        await manager.save(OrderItem, item);

        const findOrder = await manager.findOneOrFail(Order, {
          where: { id: savedOrder.id },
        });

        return {
          exists: false,
          order: findOrder,
        }
      });
      if (!trxRes) {
        return {
          status: new Status(StatusCode.SYSTEM_INTERNAL_ERROR, 'failed create order'),
        };
      }
      if (trxRes instanceof Status) {
        return {
          status: trxRes
        }
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success create order'),
        order: {
          exists: trxRes.exists,
          unique_id: trxRes.order.unique_id,
        }
      };
    } catch (e: unknown) {
      console.error(e)
      return {
        status: Status.fromError(e),
      };
    }
  }
}
