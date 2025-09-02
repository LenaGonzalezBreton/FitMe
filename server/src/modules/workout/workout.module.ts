import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { StartWorkoutSessionUseCase } from './application/use-cases/start-workout-session.use-case';
import { CompleteWorkoutSessionUseCase } from './application/use-cases/complete-workout-session.use-case';
import { GetWorkoutSessionUseCase } from './application/use-cases/get-workout-session.use-case';
import { GetUserWorkoutSessionsUseCase } from './application/use-cases/get-user-workout-sessions.use-case';
import { LogExerciseCompletionUseCase } from './application/use-cases/log-exercise-completion.use-case';
import { PauseWorkoutSessionUseCase } from './application/use-cases/pause-workout-session.use-case';
import { ResumeWorkoutSessionUseCase } from './application/use-cases/resume-workout-session.use-case';
import { GetWorkoutStatsUseCase } from './application/use-cases/get-workout-stats.use-case';

// Infrastructure Repositories
import { PrismaWorkoutSessionRepository } from './infrastructure/prisma-workout-session.repository';
import { PrismaWorkoutExerciseRepository } from './infrastructure/prisma-workout-exercise.repository';

// Controller
import { WorkoutController } from './controller/workout.controller';

// Tokens for DI
import { WORKOUT_SESSION_REPOSITORY_TOKEN, WORKOUT_EXERCISE_REPOSITORY_TOKEN } from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [WorkoutController],
  providers: [
    // Use Cases
    StartWorkoutSessionUseCase,
    CompleteWorkoutSessionUseCase,
    GetWorkoutSessionUseCase,
    GetUserWorkoutSessionsUseCase,
    LogExerciseCompletionUseCase,
    PauseWorkoutSessionUseCase,
    ResumeWorkoutSessionUseCase,
    GetWorkoutStatsUseCase,

    // Repositories
    {
      provide: WORKOUT_SESSION_REPOSITORY_TOKEN,
      useClass: PrismaWorkoutSessionRepository,
    },
    {
      provide: WORKOUT_EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaWorkoutExerciseRepository,
    },
  ],
  exports: [
    StartWorkoutSessionUseCase,
    CompleteWorkoutSessionUseCase,
    GetWorkoutSessionUseCase,
    GetUserWorkoutSessionsUseCase,
    LogExerciseCompletionUseCase,
    PauseWorkoutSessionUseCase,
    ResumeWorkoutSessionUseCase,
    GetWorkoutStatsUseCase,
  ],
})
export class WorkoutModule {}
