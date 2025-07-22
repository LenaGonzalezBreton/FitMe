import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetExercisesByPhaseUseCase } from './application/use-cases/get-exercises-by-phase.use-case';
import { GetExerciseDetailsUseCase } from './application/use-cases/get-exercise-details.use-case';
import { AddToFavoritesUseCase } from './application/use-cases/add-to-favorites.use-case';
import { RemoveFromFavoritesUseCase } from './application/use-cases/remove-from-favorites.use-case';
import { GetFavoriteExercisesUseCase } from './application/use-cases/get-favorite-exercises.use-case';
import { RateExerciseUseCase } from './application/use-cases/rate-exercise.use-case';
import { CreateExerciseUseCase } from './application/use-cases/create-exercise.use-case';

// Infrastructure Repositories
import { PrismaExerciseRepository } from './infrastructure/prisma-exercise.repository';
import { PrismaPhaseExerciseRepository } from './infrastructure/prisma-phase-exercise.repository';
import { PrismaFavoriteExerciseRepository } from './infrastructure/prisma-favorite-exercise.repository';
import { PrismaExerciseRatingRepository } from './infrastructure/prisma-exercise-rating.repository';

// Controller
import { ExerciseController } from './controller/exercise.controller';

// Tokens for DI
import {
  EXERCISE_REPOSITORY_TOKEN,
  PHASE_EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [ExerciseController],
  providers: [
    // Use Cases
    GetExercisesByPhaseUseCase,
    GetExerciseDetailsUseCase,
    AddToFavoritesUseCase,
    RemoveFromFavoritesUseCase,
    GetFavoriteExercisesUseCase,
    RateExerciseUseCase,
    CreateExerciseUseCase,

    // Repository Implementations
    {
      provide: EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaExerciseRepository,
    },
    {
      provide: PHASE_EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaPhaseExerciseRepository,
    },
    {
      provide: FAVORITE_EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaFavoriteExerciseRepository,
    },
    {
      provide: EXERCISE_RATING_REPOSITORY_TOKEN,
      useClass: PrismaExerciseRatingRepository,
    },
  ],
  exports: [
    GetExercisesByPhaseUseCase,
    GetExerciseDetailsUseCase,
    AddToFavoritesUseCase,
    RemoveFromFavoritesUseCase,
    GetFavoriteExercisesUseCase,
    RateExerciseUseCase,
    CreateExerciseUseCase,
    EXERCISE_REPOSITORY_TOKEN,
    PHASE_EXERCISE_REPOSITORY_TOKEN,
    FAVORITE_EXERCISE_REPOSITORY_TOKEN,
    EXERCISE_RATING_REPOSITORY_TOKEN,
  ],
})
export class ExerciseModule {}
