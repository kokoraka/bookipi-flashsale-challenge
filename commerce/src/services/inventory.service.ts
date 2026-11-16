import {
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import * as redis from 'redis';
import { CLIENT_REDIS_TOKEN } from './redis/redis.js'

export const SERVICE_INVENTORY_TOKEN = Symbol('SERVICE_INVENTORY_TOKEN');

export interface InventoryServiceInterface {
  reserveStock(p: ReserveStockParam): ReserveStockResult
}

export type ReserveStockParam = {
  // e.g: inventory:01a1dd34-b2fc-7fa1-b7e1-b98267225dfa
  inventory_key: string
  // e.g: order:01a1dd34-b2fc-7fa1-b7e1-b98267225dfa
  identifier_key: string
  // e.g: raka.suryaardi@gmail.com
  identifier_id: string
  // e.g: 1
  identifier_limit: string
}

export type ReserveStockResult = {
  code: ReserveStockCode;
}

export enum ReserveStockCode {
  RESERVE_SUCCESS = 1,
  RESERVE_OUT_OF_STOCK = -1,
  RESERVE_LIMIT_REACHED = -2,
}

@Injectable()
export class InventoryService implements OnModuleDestroy {
  private readonly reserveStockScript = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'reserve-stock.lua'),
    'utf8',
  );

  constructor(
    @Inject(CLIENT_REDIS_TOKEN)
    private readonly client: redis.RedisClientType,
  ) { }

  async reserveStock(p: ReserveStockParam): Promise<ReserveStockResult> {
    const keys = [p.inventory_key, p.identifier_key]
    const args = [p.identifier_id, p.identifier_limit]
    const evalRes = await this.client.eval(this.reserveStockScript, {
      keys,
      arguments: args
    }) as number[];

    const [code] = evalRes

    return {
      code,
    };
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}