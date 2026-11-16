import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module.js';
import { HttpExceptionFilter } from './exception-filter.js';
import { ConsoleLogger } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT ?? 4001
  const env = process.env.NODE_ENV
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: env === 'production' || env === 'development',
      logLevels: ['log', 'warn', 'error', 'fatal'],
    }),
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
}

await bootstrap();
