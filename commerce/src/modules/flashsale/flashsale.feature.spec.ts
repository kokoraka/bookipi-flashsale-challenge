
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { FlashSaleFeature } from './flashsale.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';
import type { ProductRepositoryInterface } from '../../repositories/repository.js';
import { FileObject } from './../file/file.js';
import type { ConfigService } from '@nestjs/config';

describe('FlashSaleFeature', () => {
  let feature: FlashSaleFeature;

  let productRepo: {
    getProduct: ReturnType<typeof vi.fn>;
  };

  let configService: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    productRepo = {
      getProduct: vi.fn(),
    };

    configService = {
      get: vi.fn(),
    };

    feature = new FlashSaleFeature(
      configService as unknown as ConfigService,
      productRepo as unknown as ProductRepositoryInterface,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProduct', () => {
    const param = {
      unique_id: 'product-123',
    };

    const product = {
      unique_id: 'product-123',
      name: 'Flash Sale Product',
      description: 'Product description',
      thumbnail: {
        provider: 'local',
        file: {
          unique_id: 'file-123',
        },
      } as FileObject,
      selling_price: 100000,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-02T00:00:00.000Z'),
    };

    describe('when the product exists', () => {
      it('returns the product repository result', async () => {
        const expected = {
          status: new Status(StatusCode.SUCCESS, 'success get product'),
          product,
        };

        productRepo.getProduct.mockResolvedValue(expected);

        const result = await feature.getProduct(param);

        expect(productRepo.getProduct).toHaveBeenCalledTimes(1);
        expect(productRepo.getProduct).toHaveBeenCalledWith({
          unique_id: param.unique_id,
        });
        expect(result).toBe(expected);
      });
    });

    describe('when the product repository throws an Error', () => {
      it('returns an error status', async () => {
        const error = new Error('Database connection failed');

        productRepo.getProduct.mockRejectedValue(error);

        const result = await feature.getProduct(param);

        expect(productRepo.getProduct).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('product');
      });
    });

    describe('when the product repository throws a non-Error value', () => {
      it('returns an error status', async () => {
        const error = 'Unexpected repository error';

        productRepo.getProduct.mockRejectedValue(error);

        const result = await feature.getProduct(param);

        expect(productRepo.getProduct).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('product');
      });
    });
  });

  describe('getPromotion', () => {
    const promotionId = 'promotion-123';
    const startTime = new Date('2026-11-15T10:00:00.000Z');
    const endTime = new Date('2026-11-15T12:00:00.000Z');

    describe('when promotion is enabled', () => {
      it('returns promotion details and its state', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T11:00:00.000Z'));

        configService.get.mockImplementation((key: string) => {
          const config: Record<string, unknown> = {
            PROMOTION_ENABLED: true,
            PROMOTION_ID: promotionId,
            PROMOTION_START_TIME: startTime.getTime().toString(),
            PROMOTION_END_TIME: endTime.getTime().toString(),
          };

          return config[key];
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(configService.get).toHaveBeenCalledWith('PROMOTION_ENABLED');
        expect(configService.get).toHaveBeenCalledWith('PROMOTION_ID');
        expect(configService.get).toHaveBeenCalledWith('PROMOTION_START_TIME');
        expect(configService.get).toHaveBeenCalledWith('PROMOTION_END_TIME');

        expect(result).toEqual({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion: {
            unique_id: promotionId,
            start_at: startTime,
            end_at: endTime,
          },
          promotion_state: expect.any(String),
        });
      });
    });

    describe('when promotion is disabled', () => {
      it('returns promotion details with the disabled state', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T11:00:00.000Z'));

        configService.get.mockImplementation((key: string) => {
          const config: Record<string, unknown> = {
            PROMOTION_ENABLED: false,
            PROMOTION_ID: promotionId,
            PROMOTION_START_TIME: startTime.getTime().toString(),
            PROMOTION_END_TIME: endTime.getTime().toString(),
          };

          return config[key];
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion: {
            unique_id: promotionId,
            start_at: startTime,
            end_at: endTime,
          },
          promotion_state: expect.any(String),
        });
      });
    });

    describe('when promotion configuration is missing', () => {
      it('uses default configuration values', async () => {
        configService.get.mockReturnValue(undefined);

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status: new Status(StatusCode.RESOURCE_NOT_FOUND, 'promotion not found'),
        });
      });
    });

    describe('when configuration retrieval throws an Error', () => {
      it('returns an error status', async () => {
        const error = new Error('Configuration retrieval failed');

        configService.get.mockImplementation(() => {
          throw error;
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });

    describe('when configuration retrieval throws a non-Error value', () => {
      it('returns an error status', async () => {
        const error = 'Unexpected configuration error';

        configService.get.mockImplementation(() => {
          throw error;
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });
  });
});
