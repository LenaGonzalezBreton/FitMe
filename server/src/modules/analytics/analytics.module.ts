import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import {
  GetUserAnalyticsUseCase,
  GetWorkoutAnalyticsUseCase,
  GetCycleAnalyticsUseCase,
  GetProgressInsightsUseCase,
} from './application/use-cases';

// Infrastructure Repositories
import { PrismaAnalyticsRepository } from './infrastructure/prisma-analytics.repository';

// Controller
import { AnalyticsController } from './controller/analytics.controller';

// Tokens for DI
import { ANALYTICS_REPOSITORY_TOKEN } from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [AnalyticsController],
  providers: [
    // Use Cases
    GetUserAnalyticsUseCase,
    GetWorkoutAnalyticsUseCase,
    GetCycleAnalyticsUseCase,
    GetProgressInsightsUseCase,

    // Repository Implementations
    {
      provide: ANALYTICS_REPOSITORY_TOKEN,
      useClass: PrismaAnalyticsRepository,
    },
  ],
  exports: [
    GetUserAnalyticsUseCase,
    GetWorkoutAnalyticsUseCase,
    GetCycleAnalyticsUseCase,
    GetProgressInsightsUseCase,
    ANALYTICS_REPOSITORY_TOKEN,
  ],
})
export class AnalyticsModule {}

