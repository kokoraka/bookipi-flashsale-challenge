
import {
  ProductRepositoryInterface,
  GetProductParam,
  GetProductResult,
} from '../repository.js';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Product } from './../../models/product.model.js';
import { Status } from './../../entities/status/Status.js';
import { StatusCode } from './../../entities/status/StatusCode.js';

@Injectable()
export class ProductRepository implements ProductRepositoryInterface {

  constructor(
    @InjectDataSource('secondary')
    private readonly secondarySource: DataSource
  ) { }

  async getProduct(p: GetProductParam): Promise<GetProductResult> {
    try {
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
        }
      };
    } catch (e: unknown) {
      return {
        status: Status.fromError(e),
      };
    }
  }
}
