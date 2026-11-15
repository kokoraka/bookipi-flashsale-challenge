
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { FlashSaleController } from './flashsale.restcontroller.js';
import { FlashSaleFeature } from './flashsale.feature.js';
import { StatusCode } from '../../entities/status/StatusCode.js';

describe('FlashSaleController', () => {
  let controller: FlashSaleController;

  let flashSaleFeature: {
    getProduct: ReturnType<typeof vi.fn>;
    getPromotion: ReturnType<typeof vi.fn>;
  };

  let res: {
    status: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    flashSaleFeature = {
      getProduct: vi.fn(),
      getPromotion: vi.fn(),
    };

    res = {
      status: vi.fn(),
    };

    controller = new FlashSaleController(
      flashSaleFeature as unknown as FlashSaleFeature,
    );
  });

  describe('getProduct', () => {
    const productId = 'product-123';

    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const product = {
      unique_id: productId,
      name: 'Flash Sale Product',
      description: 'Product description',
      selling_price: 150000,
      thumbnail: {
        unique_id: 'file-123',
      },
      created_at: createdAt,
      updated_at: updatedAt,
    };

    const successStatus = {
      code: 'SUCCESS',
      message: 'Success',
      valid: vi.fn().mockReturnValue(true),
      is: vi.fn(),
    };

    const notFoundStatus = {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Product not found',
      valid: vi.fn().mockReturnValue(false),
      is: vi.fn().mockImplementation(
        (code: StatusCode) =>
          code === StatusCode.RESOURCE_NOT_FOUND,
      ),
    };

    const internalErrorStatus = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      valid: vi.fn().mockReturnValue(false),
      is: vi.fn().mockReturnValue(false),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('when the product exists', () => {
      it('returns the product with HTTP 200', async () => {
        flashSaleFeature.getProduct.mockResolvedValue({
          status: successStatus,
          product,
        });

        const result = await controller.getProduct(
          productId,
          res as unknown as Response,
        );

        expect(flashSaleFeature.getProduct).toHaveBeenCalledTimes(1);
        expect(flashSaleFeature.getProduct).toHaveBeenCalledWith({
          unique_id: productId,
        });

        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
          data: {
            product: {
              unique_id: product.unique_id,
              name: product.name,
              description: product.description,
              selling_price: '150000',
              thumbnail: product.thumbnail,
              created_at: createdAt.getTime(),
              updated_at: updatedAt.getTime(),
            },
          },
        });
      });

      it('returns optional fields as undefined when they are absent', async () => {
        const productWithoutOptionalFields = {
          unique_id: productId,
          name: 'Flash Sale Product',
          selling_price: 150000,
          created_at: createdAt,
        };

        flashSaleFeature.getProduct.mockResolvedValue({
          status: successStatus,
          product: productWithoutOptionalFields,
        });

        const result = await controller.getProduct(
          productId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result.data?.product).toEqual({
          unique_id: productId,
          name: 'Flash Sale Product',
          description: undefined,
          selling_price: '150000',
          thumbnail: undefined,
          created_at: createdAt.getTime(),
          updated_at: undefined,
        });
      });
    });

    describe('when the product does not exist', () => {
      it('returns HTTP 404 when the status is RESOURCE_NOT_FOUND', async () => {
        flashSaleFeature.getProduct.mockResolvedValue({
          status: notFoundStatus,
        });

        const result = await controller.getProduct(
          productId,
          res as unknown as Response,
        );

        expect(flashSaleFeature.getProduct).toHaveBeenCalledWith({
          unique_id: productId,
        });

        expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

        expect(result).toEqual({
          status: {
            code: notFoundStatus.code,
            message: notFoundStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the feature returns an internal error', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getProduct.mockResolvedValue({
          status: internalErrorStatus,
        });

        const result = await controller.getProduct(
          productId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: internalErrorStatus.code,
            message: internalErrorStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the status is valid but the product is missing', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getProduct.mockResolvedValue({
          status: successStatus,
          product: undefined,
        });

        const result = await controller.getProduct(
          productId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });
  });

  describe('getPromotion', () => {
    const promotionId = 'promotion-123';

    const startAt = new Date('2026-11-15T10:00:00.000Z');
    const endAt = new Date('2026-11-15T12:00:00.000Z');

    const promotion = {
      unique_id: promotionId,
      start_at: startAt,
      end_at: endAt,
    };

    const successStatus = {
      code: 'SUCCESS',
      message: 'Success',
      valid: vi.fn().mockReturnValue(true),
      is: vi.fn(),
    };

    const notFoundStatus = {
      code: 'RESOURCE_NOT_FOUND',
      message: 'Promotion not found',
      valid: vi.fn().mockReturnValue(false),
      is: vi.fn().mockImplementation(
        (code: StatusCode) =>
          code === StatusCode.RESOURCE_NOT_FOUND,
      ),
    };

    const internalErrorStatus = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      valid: vi.fn().mockReturnValue(false),
      is: vi.fn().mockReturnValue(false),
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('when the promotion exists', () => {
      it('returns the promotion with HTTP 200', async () => {
        const promotionState = 'ACTIVE';

        flashSaleFeature.getPromotion.mockResolvedValue({
          status: successStatus,
          promotion,
          promotion_state: promotionState,
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(flashSaleFeature.getPromotion).toHaveBeenCalledTimes(1);
        expect(flashSaleFeature.getPromotion).toHaveBeenCalledWith({
          unique_id: promotionId,
        });

        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
          data: {
            promotion: {
              unique_id: promotion.unique_id,
              start_at: startAt.getTime(),
              end_at: endAt.getTime(),
            },
            promotion_state: promotionState,
          },
        });
      });

      it('returns end_at as undefined when it is absent', async () => {
        const promotionWithoutEndAt = {
          unique_id: promotionId,
          start_at: startAt,
        };

        flashSaleFeature.getPromotion.mockResolvedValue({
          status: successStatus,
          promotion: promotionWithoutEndAt,
          promotion_state: 'UPCOMING',
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);

        expect(result.data?.promotion).toEqual({
          unique_id: promotionId,
          start_at: startAt.getTime(),
          end_at: undefined,
        });

        expect(result.data?.promotion_state).toBe('UPCOMING');
      });
    });

    describe('when the promotion does not exist', () => {
      it('returns HTTP 404 when the status is RESOURCE_NOT_FOUND', async () => {
        flashSaleFeature.getPromotion.mockResolvedValue({
          status: notFoundStatus,
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(flashSaleFeature.getPromotion).toHaveBeenCalledWith({
          unique_id: promotionId,
        });

        expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);

        expect(result).toEqual({
          status: {
            code: notFoundStatus.code,
            message: notFoundStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the feature returns an internal error', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getPromotion.mockResolvedValue({
          status: internalErrorStatus,
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: internalErrorStatus.code,
            message: internalErrorStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the status is valid but the promotion is missing', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getPromotion.mockResolvedValue({
          status: successStatus,
          promotion: undefined,
          promotion_state: 'ACTIVE',
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when the promotion state is missing', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getPromotion.mockResolvedValue({
          status: successStatus,
          promotion,
          promotion_state: undefined,
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });

    describe('when both promotion and promotion state are missing', () => {
      it('returns HTTP 500', async () => {
        flashSaleFeature.getPromotion.mockResolvedValue({
          status: successStatus,
        });

        const result = await controller.getPromotion(
          promotionId,
          res as unknown as Response,
        );

        expect(res.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        expect(result).toEqual({
          status: {
            code: successStatus.code,
            message: successStatus.message,
          },
        });

        expect(result).not.toHaveProperty('data');
      });
    });
  });
});
