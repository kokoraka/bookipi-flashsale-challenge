import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { CLIENT_REDIS_TOKEN } from './redis/redis.js';
import { InventoryService, SERVICE_INVENTORY_TOKEN } from './inventory.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SERVICE_INVENTORY_TOKEN,
      useClass: InventoryService,
    },
    {
      provide: CLIENT_REDIS_TOKEN,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REPOSITORY_CACHE_REDIS_HOST');
        const port = configService.get<number>('REPOSITORY_CACHE_REDIS_PORT');

        const client = createClient({
          url: `redis://${host}:${port}`,
        });
        client.on('error', (error) => {
          console.error('Redis error:', error);
        });

        await client.connect();

        return client;
      },
    },
  ],
  exports: [SERVICE_INVENTORY_TOKEN],
})
export class InventoryModule { }