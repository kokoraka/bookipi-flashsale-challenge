
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FlashSaleFeature } from './flashsale.feature.js';
import { Status, StatusCode } from '../../entities/status/index.js';
import type { ProductRepositoryInterface } from '../../repositories/repository.js';
import { FileObject } from './../file/file.js';

describe('FlashSaleFeature', () => {
  let feature: FlashSaleFeature;
  let productRepo: {
    getProduct: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    productRepo = {
      getProduct: vi.fn(),
    };

    feature = new FlashSaleFeature(
      productRepo as unknown as ProductRepositoryInterface,
    );
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
        }
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
        expect(result.status).toEqual(Status.fromError(error));
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
});
