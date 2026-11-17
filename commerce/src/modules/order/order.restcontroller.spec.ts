
import { HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { OrderController } from './order.restcontroller.js';
import { OrderFeature } from './order.feature.js';
import type {
  PlaceOrderResult,
  GetOrderResult,
} from './order.feature.js';
import { Status } from '../../entities/status/Status.js';
import { StatusCode } from '../../entities/status/StatusCode.js';
import { OrderStatus } from '../../entities/order/OrderStatus.js';

describe('OrderController', () => {
  let controller: OrderController;

  let orderFeature: {
    placeOrder: ReturnType<typeof vi.fn<OrderFeature['placeOrder']>>;
    getOrder: ReturnType<typeof vi.fn<OrderFeature['getOrder']>>;
  };

  let response: Response;
  let responseStatus: ReturnType<typeof vi.fn>;

  const createPlaceOrderResult = (
    result: Partial<PlaceOrderResult>,
  ): PlaceOrderResult => result as PlaceOrderResult;

  const createGetOrderResult = (
    result: Partial<GetOrderResult>,
  ): GetOrderResult => result as GetOrderResult;

  const request = {
    email: 'customer@example.com',
    name: 'John Doe',
    item_id: 'product-123',
    quantity: '1',
    promotion_id: '1',
  };

  const idempotencyKey = 'idempotency-key-123';

  const orderInfo = {
    unique_id: 'order-123',
    buyer_name: 'John Doe',
    buyer_email: 'customer@example.com',
    status: OrderStatus.PENDING,
    grand_total: 10000,
    placed_at: new Date('2026-11-15T10:00:00.000Z'),
    created_at: new Date('2026-11-15T10:00:00.000Z'),
    updated_at: new Date('2026-11-15T10:01:00.000Z'),
    items: [
      {
        unique_id: 'line-123',
        name: 'Product Name',
        description: 'Product Description',
        quantity: 1,
        unit_price: 10000,
      },
    ],
  };

  const mockOrderFound = () => {
    orderFeature.getOrder.mockResolvedValue(
      createGetOrderResult({
        status: new Status(StatusCode.SUCCESS, 'success'),
        order: orderInfo,
      }),
    );
  };

  beforeEach(() => {
    orderFeature = {
      placeOrder: vi.fn<OrderFeature['placeOrder']>(),
      getOrder: vi.fn<OrderFeature['getOrder']>(),
    };

    controller = new OrderController(
      orderFeature as unknown as OrderFeature,
    );

    responseStatus = vi.fn().mockReturnThis();

    response = {
      status: responseStatus,
    } as unknown as Response;
  });

  describe('placeOrder', () => {
    describe('when the order is successfully created', () => {
      it('should return CREATED with the order unique ID', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: {
              exists: false,
              unique_id: 'order-123',
            },
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(orderFeature.placeOrder).toHaveBeenCalledExactlyOnceWith({
          idempotency_key: idempotencyKey,
          email: request.email,
          name: request.name,
          item_id: request.item_id,
          quantity: request.quantity,
          promotion_id: request.promotion_id,
        });

        expect(responseStatus).toHaveBeenCalledWith(HttpStatus.ACCEPTED);

        expect(result).toEqual({
          status: {
            code: StatusCode.SUCCESS,
            message: expect.any(String),
          },
          data: {
            order: {
              unique_id: 'order-123',
            },
          },
        });
      });
    });

    describe('when the order already exists', () => {
      it('should return OK with the existing order unique ID', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: {
              exists: true,
              unique_id: 'order-123',
            },
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(responseStatus).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result.data?.order.unique_id).toBe('order-123');
      });
    });

    describe('when the request has invalid parameters', () => {
      it('should return BAD_REQUEST', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_PARAM,
              'Product not found',
            ),
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(responseStatus).toHaveBeenCalledWith(
          HttpStatus.BAD_REQUEST,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.VALIDATION_INVALID_PARAM,
            message: 'Product not found',
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the promotion has ended', () => {
      it('should return CONFLICT', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_STATE,
              'promotion has ended',
            ),
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(responseStatus).toHaveBeenCalledWith(
          HttpStatus.CONFLICT,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.VALIDATION_INVALID_STATE,
            message: 'promotion has ended',
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when an unexpected error occurs', () => {
      it('should return INTERNAL_SERVER_ERROR', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(
              StatusCode.SYSTEM_INTERNAL_ERROR,
              'Something went wrong',
            ),
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(responseStatus).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.SYSTEM_INTERNAL_ERROR,
            message: 'Something went wrong',
          },
        });
      });
    });

    describe('when the status is valid but the order is missing', () => {
      it('should return INTERNAL_SERVER_ERROR', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: undefined,
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(responseStatus).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when optional request fields are missing', () => {
      it('should pass undefined values to OrderFeature', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createPlaceOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: {
              exists: false,
              unique_id: 'order-123',
            },
          }),
        );

        await controller.placeOrder(
          response,
          undefined,
          undefined,
        );

        expect(orderFeature.placeOrder).toHaveBeenCalledExactlyOnceWith({
          idempotency_key: undefined,
          email: undefined,
          name: undefined,
          item_id: undefined,
          quantity: undefined,
        });
      });
    });

    describe('when OrderFeature throws an exception', () => {
      it('should propagate the exception', async () => {
        const error = new Error('Database unavailable');

        orderFeature.placeOrder.mockRejectedValue(error);

        await expect(
          controller.placeOrder(response, request, idempotencyKey),
        ).rejects.toThrow(error);
      });
    });
  });

  describe('getOrder', () => {
    const orderId = 'order-123';

    describe('when the order is successfully retrieved', () => {
      beforeEach(() => {
        mockOrderFound();
      });

      it('should retrieve the order using the provided ID', async () => {
        await controller.getOrder(orderId, response);

        expect(orderFeature.getOrder).toHaveBeenCalledExactlyOnceWith({
          unique_id: orderId,
        });
      });

      it('should return OK', async () => {
        await controller.getOrder(orderId, response);

        expect(responseStatus).toHaveBeenCalledExactlyOnceWith(
          HttpStatus.OK,
        );
      });

      it('should return the order details with the correct response mapping', async () => {
        const result = await controller.getOrder(orderId, response);

        expect(result).toEqual({
          status: {
            code: StatusCode.SUCCESS,
            message: 'success',
          },
          data: {
            order: {
              unique_id: 'order-123',
              buyer_email: 'customer@example.com',
              buyer_name: 'John Doe',
              grand_total: '10000',
              status: OrderStatus.PENDING,
              placed_at: orderInfo.placed_at.getTime(),
              created_at: orderInfo.created_at.getTime(),
              updated_at: orderInfo.updated_at?.getTime(),
              items: [
                {
                  unique_id: 'line-123',
                  name: 'Product Name',
                  description: 'Product Description',
                  quantity: '1',
                  unit_price: '10000',
                },
              ],
            },
          },
        });
      });

      it('should convert numeric values to strings', async () => {
        const result = await controller.getOrder(orderId, response);

        expect(result.data?.order.grand_total).toBe('10000');
        expect(result.data?.order.items[0].quantity).toBe('1');
        expect(result.data?.order.items[0].unit_price).toBe('10000');
      });

      it('should convert dates to Unix timestamps in milliseconds', async () => {
        const result = await controller.getOrder(orderId, response);

        expect(result.data?.order.placed_at).toBe(
          orderInfo.placed_at.getTime(),
        );

        expect(result.data?.order.created_at).toBe(
          orderInfo.created_at.getTime(),
        );

        expect(result.data?.order.updated_at).toBe(
          orderInfo.updated_at?.getTime(),
        );
      });

      it('should map all order items', async () => {
        const result = await controller.getOrder(orderId, response);

        expect(result.data?.order.items).toHaveLength(1);

        expect(result.data?.order.items[0]).toEqual({
          unique_id: 'line-123',
          name: 'Product Name',
          description: 'Product Description',
          quantity: '1',
          unit_price: '10000',
        });
      });
    });

    describe('when the order has no items', () => {
      it('should return an empty items array', async () => {
        orderFeature.getOrder.mockResolvedValue(
          createGetOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: {
              ...orderInfo,
              items: [],
            },
          }),
        );

        const result = await controller.getOrder(orderId, response);

        expect(result.data?.order.items).toEqual([]);
      });
    });

    describe('when the order has no updated_at timestamp', () => {
      it('should return undefined for updated_at', async () => {
        const {
          updated_at: _updatedAt,
          ...orderWithoutUpdatedAt
        } = orderInfo;

        orderFeature.getOrder.mockResolvedValue(
          createGetOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: orderWithoutUpdatedAt,
          }),
        );

        const result = await controller.getOrder(orderId, response);

        expect(result.data?.order.updated_at).toBeUndefined();
      });
    });

    describe('when the order is not found', () => {
      it('should return NOT_FOUND', async () => {
        const status = new Status(
          StatusCode.RESOURCE_NOT_FOUND,
          'order not found',
        );

        orderFeature.getOrder.mockResolvedValue(
          createGetOrderResult({
            status,
            order: undefined,
          }),
        );

        const result = await controller.getOrder(orderId, response);

        expect(orderFeature.getOrder).toHaveBeenCalledExactlyOnceWith({
          unique_id: orderId,
        });

        expect(responseStatus).toHaveBeenCalledExactlyOnceWith(
          HttpStatus.NOT_FOUND,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.RESOURCE_NOT_FOUND,
            message: 'order not found',
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when another unsuccessful status is returned', () => {
      it('should return INTERNAL_SERVER_ERROR', async () => {
        const status = new Status(
          StatusCode.VALIDATION_INVALID_STATE,
          'unable to retrieve order',
        );

        orderFeature.getOrder.mockResolvedValue(
          createGetOrderResult({
            status,
            order: undefined,
          }),
        );

        const result = await controller.getOrder(orderId, response);

        expect(responseStatus).toHaveBeenCalledExactlyOnceWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.VALIDATION_INVALID_STATE,
            message: 'unable to retrieve order',
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the status is successful but the order is missing', () => {
      it('should return INTERNAL_SERVER_ERROR', async () => {
        orderFeature.getOrder.mockResolvedValue(
          createGetOrderResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: undefined,
          }),
        );

        const result = await controller.getOrder(orderId, response);

        expect(responseStatus).toHaveBeenCalledExactlyOnceWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: StatusCode.SUCCESS,
            message: 'success',
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when OrderFeature throws an exception', () => {
      it('should propagate the exception', async () => {
        const error = new Error('Order database unavailable');

        orderFeature.getOrder.mockRejectedValue(error);

        await expect(
          controller.getOrder(orderId, response),
        ).rejects.toThrow(error);
      });
    });
  });
});
