
import { HttpStatus } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import { OrderController } from './order.restcontroller.js';
import { OrderFeature } from './order.feature.js';
import { Status } from '../../entities/status/Status.js';
import { StatusCode } from '../../entities/status/StatusCode.js';

type PlaceOrderResult = Awaited<ReturnType<OrderFeature['placeOrder']>>;

describe('OrderController', () => {
  let controller: OrderController;
  let orderFeature: {
    placeOrder: ReturnType<typeof vi.fn<OrderFeature['placeOrder']>>;
  };
  let response: Response;

  beforeEach(() => {
    orderFeature = {
      placeOrder: vi.fn<OrderFeature['placeOrder']>(),
    };

    controller = new OrderController(orderFeature as unknown as OrderFeature);

    response = {
      status: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  describe('placeOrder', () => {
    const request = {
      email: 'customer@example.com',
      name: 'John Doe',
      item_id: 'product-123',
      quantity: '2',
    };

    const idempotencyKey = 'idempotency-key-123';

    const createResult = (
      result: Partial<PlaceOrderResult>,
    ): PlaceOrderResult => result as PlaceOrderResult;

    describe('when the order is successfully created', () => {
      it('should return CREATED with the order unique ID', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createResult({
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
        });

        expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);

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
          createResult({
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

        expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result.data?.order.unique_id).toBe('order-123');
      });
    });

    describe('when the request has invalid parameters', () => {
      it('should return BAD_REQUEST', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createResult({
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

        expect(response.status).toHaveBeenCalledWith(
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

    describe('when the order is in an invalid state', () => {
      it('should return BAD_REQUEST', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createResult({
            status: new Status(
              StatusCode.VALIDATION_INVALID_STATE,
              'Insufficient product quantity',
            ),
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(response.status).toHaveBeenCalledWith(
          HttpStatus.BAD_REQUEST,
        );

        expect(result.status).toEqual({
          code: StatusCode.VALIDATION_INVALID_STATE,
          message: 'Insufficient product quantity',
        });
      });
    });

    describe('when an unexpected error occurs', () => {
      it('should return INTERNAL_SERVER_ERROR', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createResult({
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

        expect(response.status).toHaveBeenCalledWith(
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
          createResult({
            status: new Status(StatusCode.SUCCESS, 'success'),
            order: undefined,
          }),
        );

        const result = await controller.placeOrder(
          response,
          request,
          idempotencyKey,
        );

        expect(response.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when optional request fields are missing', () => {
      it('should pass undefined values to OrderFeature', async () => {
        orderFeature.placeOrder.mockResolvedValue(
          createResult({
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
});
