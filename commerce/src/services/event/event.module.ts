import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SERVICE_EVENT_TOKEN } from './event.js';
import { RedisStreamClient } from '@nestjs-redis/streams-transporter';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SERVICE_EVENT_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new RedisStreamClient({
          url: `redis://${configService.get<string>('EVENT_REDIS_HOST')}:${configService.get<number>('EVENT_REDIS_PORT')}`,
          maxStreamLength: 1_000_000,
        });
      },
    },
  ],
  exports: [SERVICE_EVENT_TOKEN],
})
export class EventModule { }