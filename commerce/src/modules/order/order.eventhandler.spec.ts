
import { describe, it as It, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderEventHandler } from './order.eventhandler.js';
import type { OrderFeatureInterface } from './order.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';

describe('OrderEventHandler', () => {
  let handler: OrderEventHandler;

  let orderFeature: {
    createOrder: ReturnType<typeof vi.fn>;
  };

  const placedAt = new Date('2026-11-17T03:00:00.000Z');

  const validMessage = {
    idempotency_key: 'idempotency-key-001',
    promotion_key: 'promotion-001',
    order_id: 'order-001',
    buyer_email: 'john@example.com',
    buyer_name: 'John Doe',
    item_id: 'product-001',
    item_quantity: 1,
    item_name: 'Product Name',
    item_description: 'Product description',
    item_unit_price: 100_000,
    placed_at: placedAt.getTime(),
  };

  const createStatus = (code: StatusCode) =>
    new Status(code, 'test status');

  const mockSuccessfulCreateOrder = () => {
    orderFeature.createOrder.mockResolvedValue({
      status: createStatus(StatusCode.SUCCESS),
      order: {
        unique_id: 'order-001',
        created_at: new Date(),
      },
    });
  };

  beforeEach(() => {
    orderFeature = {
      createOrder: vi.fn(),
    };

    handler = new OrderEventHandler(
      orderFeature as unknown as OrderFeatureInterface,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onOrderPlaced', () => {
    describe('When validating event payload', () => {
      It('should throw validation error when required fields are missing', async () => {
        const invalidMessage = {
          order_id: validMessage.order_id,
          buyer_email: validMessage.buyer_email,
        };

        await expect(
          handler.onOrderPlaced(invalidMessage),
        ).rejects.toThrow();

        expect(orderFeature.createOrder).not.toHaveBeenCalled();
      });
    });

    describe('When creating order', () => {
      It('should create order using the event payload', async () => {
        mockSuccessfulCreateOrder();

        await handler.onOrderPlaced(validMessage);

        expect(orderFeature.createOrder).toHaveBeenCalledOnce();

        expect(orderFeature.createOrder).toHaveBeenCalledWith({
          idempotency_key: validMessage.idempotency_key,
          promotion_key: validMessage.promotion_key,
          order_id: validMessage.order_id,
          buyer_email: validMessage.buyer_email,
          buyer_name: validMessage.buyer_name,
          item_id: validMessage.item_id,
          item_quantity: validMessage.item_quantity,
          item_name: validMessage.item_name,
          item_description: validMessage.item_description,
          item_unit_price: validMessage.item_unit_price,
          placed_at: placedAt,
        });
      });

      It('should convert placed_at timestamp into Date', async () => {
        mockSuccessfulCreateOrder();

        await handler.onOrderPlaced(validMessage);

        const createOrderParam = orderFeature.createOrder.mock.calls[0][0];

        expect(createOrderParam.placed_at).toBeInstanceOf(Date);
        expect(createOrderParam.placed_at.getTime()).toBe(
          validMessage.placed_at,
        );
      });

      It('should resolve when order creation succeeds', async () => {
        mockSuccessfulCreateOrder();

        await expect(
          handler.onOrderPlaced(validMessage),
        ).resolves.toBeUndefined();
      });
    });

    describe('When order creation fails', () => {
      It('should throw status when order creation returns unsuccessful status', async () => {
        const errorStatus = createStatus(
          StatusCode.VALIDATION_INVALID_PARAM,
        );

        orderFeature.createOrder.mockResolvedValue({
          status: errorStatus,
          order: undefined,
        });

        await expect(
          handler.onOrderPlaced(validMessage),
        ).rejects.toBe(errorStatus);

        expect(orderFeature.createOrder).toHaveBeenCalledOnce();
      });

      It('should throw status when order creation returns invalid state', async () => {
        const errorStatus = createStatus(
          StatusCode.VALIDATION_INVALID_STATE,
        );

        orderFeature.createOrder.mockResolvedValue({
          status: errorStatus,
          order: undefined,
        });

        await expect(
          handler.onOrderPlaced(validMessage),
        ).rejects.toBe(errorStatus);
      });

      It('should not throw when order creation returns successful status without order', async () => {
        orderFeature.createOrder.mockResolvedValue({
          status: createStatus(StatusCode.SUCCESS),
          order: undefined,
        });

        await expect(
          handler.onOrderPlaced(validMessage),
        ).resolves.toBeUndefined();
      });
    });

    describe('When an unexpected error occurs', () => {
      It('should propagate error when order creation throws', async () => {
        const error = new Error('database connection failed');

        orderFeature.createOrder.mockRejectedValue(error);

        await expect(
          handler.onOrderPlaced(validMessage),
        ).rejects.toBe(error);
      });

      It('should not call order creation when payload parsing fails', async () => {
        await expect(
          handler.onOrderPlaced(null as unknown as object),
        ).rejects.toThrow();

        expect(orderFeature.createOrder).not.toHaveBeenCalled();
      });
    });
  });
});
