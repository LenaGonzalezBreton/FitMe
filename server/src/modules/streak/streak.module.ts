import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetStreakDataUseCase } from './application/use-cases/get-streak-data.use-case';
import { LogWorkoutUseCase } from './application/use-cases/log-workout.use-case';

// Infrastructure Repositories
import { PrismaStreakRepository } from './infrastructure/prisma-streak.repository';

// Controller
import { StreakController } from './controller/streak.controller';

// Tokens for DI
import { STREAK_REPOSITORY_TOKEN } from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [StreakController],
  providers: [
    // Use Cases
    GetStreakDataUseCase,
    LogWorkoutUseCase,

    // Repositories
    {
      provide: STREAK_REPOSITORY_TOKEN,
      useClass: PrismaStreakRepository,
    },
  ],
  exports: [
    GetStreakDataUseCase,
    LogWorkoutUseCase,
  ],
})
export class StreakModule {}
