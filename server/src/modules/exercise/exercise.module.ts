import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetExercisesByPhaseUseCase } from './application/use-cases/get-exercises-by-phase.use-case';

// Infrastructure Repositories
import { PrismaExerciseRepository } from './infrastructure/prisma-exercise.repository';
import { PrismaPhaseExerciseRepository } from './infrastructure/prisma-phase-exercise.repository';

// Controller
import { ExerciseController } from './controller/exercise.controller';

// Tokens for DI
import {
  EXERCISE_REPOSITORY_TOKEN,
  PHASE_EXERCISE_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [ExerciseController],
  providers: [
    // Use Cases
    GetExercisesByPhaseUseCase,

    // Repository Implementations
    {
      provide: EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaExerciseRepository,
    },
    {
      provide: PHASE_EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaPhaseExerciseRepository,
    },
  ],
  exports: [
    GetExercisesByPhaseUseCase,
    EXERCISE_REPOSITORY_TOKEN,
    PHASE_EXERCISE_REPOSITORY_TOKEN,
  ],
})
export class ExerciseModule {}
