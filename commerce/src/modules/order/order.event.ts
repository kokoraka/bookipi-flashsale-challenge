import * as z from 'zod';

export const OrderPlacedMessageSchema = z.object({
  idempotency_key: z.string(),
  promotion_key: z.string(),
  order_id: z.string(),
  buyer_email: z.string(),
  buyer_name: z.string(),
  placed_at: z.number(),
  item_id: z.string(),
  item_name: z.string(),
  item_description: z.string(),
  item_unit_price: z.number(),
  item_quantity: z.number(),
});

export type OrderPlacedMessage = z.infer<typeof OrderPlacedMessageSchema>;
