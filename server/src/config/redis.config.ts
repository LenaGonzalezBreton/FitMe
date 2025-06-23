import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const getRedisConfig = (
  configService: ConfigService,
): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get<string>('REDIS_HOST'),
  port: configService.get<number>('REDIS_PORT'),
  isGlobal: true,
});
