import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (
  configService: ConfigService,
): CacheModuleOptions => ({
  store: 'redis' as any,
  host: configService.get<string>('REDIS_HOST') || 'localhost',
  port: Number(configService.get<string>('REDIS_PORT')) || 6379,
  isGlobal: true,
});
