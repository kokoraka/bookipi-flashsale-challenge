import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const port = process.env.PORT ?? 4002

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'app.v1',
        protoPath: join(process.cwd(), 'api/app.proto'),
        url: `0.0.0.0:${port}`,
      },
    },
  );
  await app.listen();

}
await bootstrap();
