import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/postgres.config';
import { getRedisConfig } from './config/redis.config';
import { CacheModule } from '@nestjs/cache-manager';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getRedisConfig(configService),
      inject: [ConfigService],
      isGlobal: true,
    }),
    StatusModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
