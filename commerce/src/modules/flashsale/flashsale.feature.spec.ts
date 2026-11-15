
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { FlashSaleFeature } from './flashsale.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';
import type {
  ProductRepositoryInterface,
  PromotionRepositoryInterface,
} from '../../repositories/repository.js';
import { FileObject } from './../file/file.js';

describe('FlashSaleFeature', () => {
  let feature: FlashSaleFeature;

  let productRepo: {
    getProduct: ReturnType<typeof vi.fn>;
  };

  let promotionRepo: {
    getPromotion: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    productRepo = {
      getProduct: vi.fn(),
    };

    promotionRepo = {
      getPromotion: vi.fn(),
    };

    feature = new FlashSaleFeature(
      productRepo as unknown as ProductRepositoryInterface,
      promotionRepo as unknown as PromotionRepositoryInterface,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
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

    const promotion = {
      unique_id: promotionId,
      is_enabled: true,
      start_at: startTime,
      end_at: endTime,
    };

    describe('when promotion is enabled and currently active', () => {
      it('returns promotion details and its state', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T11:00:00.000Z'));

        const expected = {
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion: {
            unique_id: promotionId,
            start_at: startTime,
            end_at: endTime,
          },
          promotion_state: expect.any(String),
        };

        promotionRepo.getPromotion.mockResolvedValue({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion,
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(promotionRepo.getPromotion).toHaveBeenCalledTimes(1);
        expect(promotionRepo.getPromotion).toHaveBeenCalledWith({
          unique_id: promotionId,
        });

        expect(result).toEqual(expected);
      });
    });

    describe('when promotion is disabled', () => {
      it('returns promotion details with its disabled state', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T11:00:00.000Z'));

        promotionRepo.getPromotion.mockResolvedValue({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion: {
            ...promotion,
            is_enabled: false,
          },
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result.status).toEqual(
          new Status(StatusCode.SUCCESS, 'success get promotion'),
        );
        expect(result.promotion).toEqual({
          unique_id: promotionId,
          start_at: startTime,
          end_at: endTime,
        });
        expect(result.promotion_state).toEqual(expect.any(String));
      });
    });

    describe('when promotion is not yet active', () => {
      it('returns the promotion state before its start time', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T09:00:00.000Z'));

        promotionRepo.getPromotion.mockResolvedValue({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion,
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result.status.is(StatusCode.SUCCESS)).toBe(true);
        expect(result.promotion_state).toEqual(expect.any(String));
      });
    });

    describe('when promotion has ended', () => {
      it('returns the promotion state after its end time', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-15T13:00:00.000Z'));

        promotionRepo.getPromotion.mockResolvedValue({
          status: new Status(StatusCode.SUCCESS, 'success get promotion'),
          promotion,
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result.status.is(StatusCode.SUCCESS)).toBe(true);
        expect(result.promotion_state).toEqual(expect.any(String));
      });
    });

    describe('when promotion repository returns a non-success status', () => {
      it('returns the repository status without promotion details', async () => {
        const status = new Status(
          StatusCode.RESOURCE_NOT_FOUND,
          'promotion not found',
        );

        promotionRepo.getPromotion.mockResolvedValue({
          status,
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(promotionRepo.getPromotion).toHaveBeenCalledWith({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status,
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });

    describe('when repository returns success without promotion data', () => {
      it('returns the repository status without promotion details', async () => {
        const status = new Status(StatusCode.SUCCESS, 'success');

        promotionRepo.getPromotion.mockResolvedValue({
          status,
          promotion: undefined,
        });

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(result).toEqual({
          status,
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });

    describe('when promotion repository throws an Error', () => {
      it('returns an error status', async () => {
        const error = new Error('Database connection failed');

        promotionRepo.getPromotion.mockRejectedValue(error);

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(promotionRepo.getPromotion).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });

    describe('when promotion repository throws a non-Error value', () => {
      it('returns an error status', async () => {
        const error = 'Unexpected repository error';

        promotionRepo.getPromotion.mockRejectedValue(error);

        const result = await feature.getPromotion({
          unique_id: promotionId,
        });

        expect(promotionRepo.getPromotion).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          status: Status.fromError(error),
        });
        expect(result).not.toHaveProperty('promotion');
        expect(result).not.toHaveProperty('promotion_state');
      });
    });
  });
});
