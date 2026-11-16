
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as ManagerCacheModule } from '@nestjs/cache-manager'
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { KeyvCacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    ManagerCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('REPOSITORY_CACHE_HOST');
        const port = configService.get<number>('REPOSITORY_CACHE_PORT');
        const redisStore = createKeyv(`redis://${host}:${port}`);
        redisStore.on('error', (err) => console.error('Redis error:', err));

        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60_000 }),
            }),
            redisStore,
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [ManagerCacheModule],
})
export class CacheModule { }
