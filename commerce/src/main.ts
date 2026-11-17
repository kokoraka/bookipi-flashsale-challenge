import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RedisStreamServer } from '@nestjs-redis/streams-transporter';
import { AppModule } from './modules/app/app.module.js';
import { HttpExceptionFilter } from './exception-filter.js';

async function bootstrap() {
  const port = process.env.PORT ?? 4001
  const env = process.env.NODE_ENV
  const eventHost = process.env.EVENT_REDIS_HOST ?? 'localhost'
  const eventPort = process.env.EVENT_REDIS_PORT ?? 6379

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
    logger: new ConsoleLogger({
      json: env === 'production' || env === 'development',
      logLevels: ['log', 'warn', 'error', 'fatal'],
    }),
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.connectMicroservice<MicroserviceOptions>({
    strategy: new RedisStreamServer({
      url: `redis://${eventHost}:${eventPort}`,
    }),
  })
  await app.startAllMicroservices();
  await app.listen(port);
}

await bootstrap();
