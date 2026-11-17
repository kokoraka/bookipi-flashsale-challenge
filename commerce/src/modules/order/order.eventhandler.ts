import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_ORDER_PLACED, FEATURE_ORDER } from './order.feature.js';
import type { OrderFeatureInterface } from './order.feature.js';
import { OrderPlacedMessageSchema } from './order.event.js';
import { StatusCode } from '../../entities/status/StatusCode.js';

@Controller()
export class OrderEventHandler {
  constructor(
    @Inject(FEATURE_ORDER)
    private readonly orderFeature: OrderFeatureInterface,
  ) { }

  @EventPattern(EVENT_ORDER_PLACED)
  async onOrderPlaced(@Payload() data: object) {
    const message = OrderPlacedMessageSchema.parse(data);

    const createRes = await this.orderFeature.createOrder({
      idempotency_key: message.idempotency_key,
      promotion_key: message.promotion_key,
      order_id: message.order_id,
      buyer_email: message.buyer_email,
      buyer_name: message.buyer_name,
      item_id: message.item_id,
      item_quantity: message.item_quantity,
      item_name: message.item_name,
      item_description: message.item_description,
      item_unit_price: message.item_unit_price,
      placed_at: new Date(message.placed_at),
    })
    if (!createRes.status.is(StatusCode.SUCCESS)) {
      throw createRes.status
    }
  }
}