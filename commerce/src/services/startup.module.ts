import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { CLIENT_REDIS_TOKEN } from './redis/redis.js';
import { ProductRepositoryModule } from '../repositories/mysql/product.module.js';
import { SERVICE_STARTUP_TOKEN, StartupService } from './startup.service.js';

@Global()
@Module({
  imports: [
    ConfigModule,
    ProductRepositoryModule
  ],
  providers: [
    {
      provide: SERVICE_STARTUP_TOKEN,
      useClass: StartupService,
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
  exports: [SERVICE_STARTUP_TOKEN],
})
export class StartupModule { }