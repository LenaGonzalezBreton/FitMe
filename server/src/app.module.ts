import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { getTypeOrmConfig } from './config/postgres.config';
import { getRedisConfig } from './config/redis.config';
import { StatusModule } from './modules/status/status.module';
import { AuthModule } from './modules/auth/auth.module';
import { CycleModule } from './modules/cycle/cycle.module';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ProgramModule } from './modules/program/program.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { StreakModule } from './modules/streak/streak.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Support env files from multiple locations to allow root-level .env usage
      // Load order: root .env (when launched from repo root), server/.env (when launched from root),
      // and local .env in server (when launched from server dir)
      envFilePath: ['.env', 'server/.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getTypeOrmConfig(configService),
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getRedisConfig(configService),
    }),
    StatusModule,
    AuthModule,
    CycleModule,
    ExerciseModule,
    ProgramModule,
    WorkoutModule,
    StreakModule,
    AnalyticsModule,
    NotificationModule,
    UserPreferencesModule,
    CoreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
