import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController as RestAppController } from './app.restcontroller.js';
import { FlashSaleModule } from '../flashsale/flashsale.module.js'
import { CacheModule } from '../../repositories/cache.module.js';
import { OrderModule } from '../order/order.module.js'
import { AppService } from '../../services/app.service.js';

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
    FlashSaleModule,
    OrderModule
  ],
  controllers: [RestAppController],
  providers: [AppService],
})
export class AppModule { }
