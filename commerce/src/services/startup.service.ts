import {
  Inject,
  Injectable,
} from '@nestjs/common';
import * as redis from 'redis';
import { CLIENT_REDIS_TOKEN } from './redis/redis.js'
import { REPOSITORY_PRODUCT_TOKEN } from '../repositories/repository.js';
import type { ProductRepositoryInterface } from '../repositories/repository.js';
import { StatusCode } from '../entities/status/StatusCode.js';

export const SERVICE_STARTUP_TOKEN = Symbol('SERVICE_STARTUP_TOKEN');

export interface StartupServiceInterface {
  refresh(): Promise<void>
}

@Injectable()
export class StartupService {

  constructor(
    @Inject(CLIENT_REDIS_TOKEN)
    private readonly client: redis.RedisClientType,
    @Inject(REPOSITORY_PRODUCT_TOKEN)
    private readonly productRepo: ProductRepositoryInterface,
  ) { }

  async refresh(): Promise<void> {
    try {
      // @todo: change hardcoded implementation
      const productId = '01a1dd34-b2fc-7fa1-b7e1-b98267225dfa'
      const lookupKey = `inventory:${productId}`

      const getInventoryRes = await this.client.get(lookupKey)
      if (getInventoryRes !== null) {
        return
      }

      const getProductRes = await this.productRepo.getProduct({
        unique_id: productId,
      })
      if (!getProductRes.status.is(StatusCode.SUCCESS) || !getProductRes.inventory) {
        return
      }

      await this.client.set(lookupKey, getProductRes.inventory?.available_quantity)
    } catch (e: unknown) {
      console.error(e)
    }
  }
}