import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RedisModule, RedisToken } from '@nestjs-redis/client';
import { RedisThrottlerStorage, ThrottlerAlgorithm } from '@nestjs-redis/throttler-storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController as RestAppController } from './app.restcontroller.js';
import { FlashSaleModule } from '../flashsale/flashsale.module.js'
import { CacheModule } from '../../repositories/cache.module.js';
import { OrderModule } from '../order/order.module.js'
import { AppService } from '../../services/app.service.js';
import { EventModule } from '../../services/event/event.module.js';
import { StartupModule } from '../../services/startup.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    CacheModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'primary',
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('REPOSITORY_MYSQL_PRIMARY_HOST'),
        port: configService.get<number>('REPOSITORY_MYSQL_PRIMARY_PORT'),
        username: configService.get('REPOSITORY_MYSQL_PRIMARY_USERNAME'),
        password: configService.get('REPOSITORY_MYSQL_PRIMARY_PASSWORD'),
        database: configService.get('REPOSITORY_MYSQL_PRIMARY_DB_NAME'),
        entities: [join(import.meta.dirname, "./../../models/*.model{.js,.ts}")],
        synchronize: false,
        logging: ["error", "warn"],
        logger: 'advanced-console',
        maxQueryExecutionTime: 1000,
        migrationsRun: true,
        migrations: [join(import.meta.dirname, "./../../migrations/**/*{.js,.ts}")],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      name: 'secondary',
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('REPOSITORY_MYSQL_SECONDARY_HOST'),
        port: configService.get<number>('REPOSITORY_MYSQL_SECONDARY_PORT'),
        username: configService.get('REPOSITORY_MYSQL_SECONDARY_USERNAME'),
        password: configService.get('REPOSITORY_MYSQL_SECONDARY_PASSWORD'),
        database: configService.get('REPOSITORY_MYSQL_SECONDARY_DB_NAME'),
        entities: [join(import.meta.dirname, "./../../models/*.model{.js,.ts}")],
        synchronize: false,
        logging: ["error", "warn"],
        logger: 'advanced-console',
        maxQueryExecutionTime: 1000,
        migrationsRun: false,
        migrations: [join(import.meta.dirname, "./../../migrations/**/*{.js,.ts}")],
      }),
      inject: [ConfigService],
    }),
    EventModule,
    ThrottlerModule.forRootAsync({
      imports: [
        RedisModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            options: {
              url: `redis://${configService.get('RATE_LIMITER_REDIS_HOST')}:${configService.get('RATE_LIMITER_REDIS_PORT')}`,
            }
          }),
          inject: [ConfigService],
        })
      ],
      inject: [RedisToken()],
      useFactory: (redis) => ({
        throttlers: [{
          ttl: 60_000,
          limit: 10_000 * 60,
        }],
        storage: new RedisThrottlerStorage(redis, ThrottlerAlgorithm.TokenBucket),
      }),
    }),
    FlashSaleModule,
    OrderModule,
    StartupModule,
  ],
  controllers: [RestAppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
  exports: []
})
export class AppModule { }
