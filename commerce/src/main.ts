import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module.js';

async function bootstrap() {
  const port = process.env.PORT ?? 4001
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}

await bootstrap();
