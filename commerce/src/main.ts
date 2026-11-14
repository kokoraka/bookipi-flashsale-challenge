import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module.js';
import { HttpExceptionFilter } from './exception-filter.js';

async function bootstrap() {
  const port = process.env.PORT ?? 4001
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
}

await bootstrap();
