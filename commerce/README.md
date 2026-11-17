# Commerce

## Todos

1. add request logging (json) on rest and event handlers to ease debugging
2. add rate limiter based on max rps that the system can handle based on testing result
3. define `thousands`, how many thousands users?
4. move performance test into separate project folder
5. refactor function result type so no need data checking
6. data seeder or refresh script to simulate the api
7. get product stock from inventory cache instead of product available_quantity (or separate the api endpoint)
8. rename `REPOSITORY_CACHE_HOST` into `REPOSITORY_CACHE_REDIS_HOST`
9. handle database down code.message become empty string
10. handle repo redis down cannot start app
11. handle messaging redis down place order hangging indefinetly
12. check idempotency-key on place-order

## Issues

1. not sure why the maxStreamLength doesn't work, for now i commented the code directly for testing purposes

```ts
// event.module.ts
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
```

```ts
// streams-transporter.client.js
publish(packet, callback) {
  if (!this.client) {
      throw new Error('Client not connected. Call connect() first.');
  }
  const requestPacket = this.assignPacketId(packet);
  const cleanup = () => this.routingMap.delete(requestPacket.id);
  try {
      const pattern = this.normalizePattern(requestPacket.pattern);
      const streamName = this.getRequestPattern(pattern);
      const serializedPacket = this.serializer.serialize(requestPacket);
      this.routingMap.set(requestPacket.id, callback);
      /**
       * , {
          TRIM: {
              strategy: 'MAXLEN',
              strategyModifier: '~',
              threshold: this.options.maxStreamLength,
          },
      }
        */
      void this.client
          .xAdd(streamName, '*', {
          e: '0',
          id: requestPacket.id,
          replyTo: this.replyStreamName,
          data: JSON.stringify(serializedPacket.data),
      })
          .catch((err) => {
          cleanup();
          callback({ err });
      });
      return cleanup;
  }
  catch (err) {
      callback({ err });
      return () => void 0;
  }
}
```
