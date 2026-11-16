
import {
  ProductRepositoryInterface,
  QueryOption,
  GetProductParam,
  GetProductResult,
} from '../repository.js';
import { parseQueryOption } from '../query.js';
import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from './../../models/product.model.js';
import { Status } from './../../entities/status/Status.js';
import { StatusCode } from './../../entities/status/StatusCode.js';

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {

  constructor(
    @Inject(CACHE_MANAGER) private repoCache: Cache,
    @InjectDataSource('secondary')
    private readonly secondarySource: DataSource
  ) { }

  async getProduct(p: GetProductParam, opts?: QueryOption): Promise<GetProductResult> {
    try {
      const {
        readCache,
        writeCache,
        cacheTtl,
        cachePrefix,
      } = parseQueryOption(opts)

      const lookupKey = `${cachePrefix ? `${cachePrefix}:` : 'product:'}${p.unique_id}`
      if (readCache) {
        const cachedValue = await this.repoCache.get<Product>(lookupKey)
        if (cachedValue) {
          return {
            status: new Status(StatusCode.SUCCESS, 'success get product'),
            product: {
              unique_id: cachedValue.unique_id,
              name: cachedValue.name,
              description: cachedValue.description,
              selling_price: cachedValue.selling_price,
              thumbnail: cachedValue.thumbnail,
              created_at: cachedValue.created_at,
              updated_at: cachedValue.updated_at,
            },
            inventory: {
              available_quantity: cachedValue.available_quantity,
            }
          };
        }
      }

      const product = await this.secondarySource.getRepository(Product)
        .createQueryBuilder('products')
        .select([
          'products.unique_id',
          'products.name',
          'products.description',
          'products.selling_price',
          'products.thumbnail',
          'products.created_at',
          'products.updated_at',
          'products.available_quantity',
        ])
        .where('unique_id = :unique_id', {
          unique_id: p.unique_id
        })
        .getOne();
      if (!product) {
        return {
          status: new Status(StatusCode.RESOURCE_NOT_FOUND, 'product not found'),
        };
      }

      if (writeCache) {
        await this.repoCache.set(lookupKey, product, cacheTtl);
      }

      return {
        status: new Status(StatusCode.SUCCESS, 'success get product'),
        product: {
          unique_id: product.unique_id,
          name: product.name,
          description: product.description,
          selling_price: product.selling_price,
          thumbnail: product.thumbnail,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
        inventory: {
          available_quantity: product.available_quantity,
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
