import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetExercisesByPhaseUseCase } from './application/use-cases/get-exercises-by-phase.use-case';
import { GetAllExercisesUseCase } from './application/use-cases/get-all-exercises.use-case';
import { GetExerciseDetailsUseCase } from './application/use-cases/get-exercise-details.use-case';
import { AddToFavoritesUseCase } from './application/use-cases/add-to-favorites.use-case';
import { RemoveFromFavoritesUseCase } from './application/use-cases/remove-from-favorites.use-case';
import { GetFavoriteExercisesUseCase } from './application/use-cases/get-favorite-exercises.use-case';
import { RateExerciseUseCase } from './application/use-cases/rate-exercise.use-case';
import { CreateExerciseUseCase } from './application/use-cases/create-exercise.use-case';
import { UpdateExerciseUseCase } from './application/use-cases/update-exercise.use-case';
import { DeleteExerciseUseCase } from './application/use-cases/delete-exercise.use-case';

// Infrastructure Repositories
import { PrismaExerciseRepository } from './infrastructure/prisma-exercise.repository';
import { PrismaFavoriteExerciseRepository } from './infrastructure/prisma-favorite-exercise.repository';
import { PrismaExerciseRatingRepository } from './infrastructure/prisma-exercise-rating.repository';

// Controller
import { ExerciseController } from './controller/exercise.controller';

// Tokens for DI
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [ExerciseController],
  providers: [
    // Use Cases
    GetExercisesByPhaseUseCase,
    GetAllExercisesUseCase,
    GetExerciseDetailsUseCase,
    AddToFavoritesUseCase,
    RemoveFromFavoritesUseCase,
    GetFavoriteExercisesUseCase,
    RateExerciseUseCase,
    CreateExerciseUseCase,
    UpdateExerciseUseCase,
    DeleteExerciseUseCase,

    // Repository Implementations
    {
      provide: EXERCISE_REPOSITORY_TOKEN,
      useClass: PrismaExerciseRepository,
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
    GetAllExercisesUseCase,
    GetExerciseDetailsUseCase,
    AddToFavoritesUseCase,
    RemoveFromFavoritesUseCase,
    GetFavoriteExercisesUseCase,
    RateExerciseUseCase,
    CreateExerciseUseCase,
    UpdateExerciseUseCase,
    DeleteExerciseUseCase,
    EXERCISE_REPOSITORY_TOKEN,
    FAVORITE_EXERCISE_REPOSITORY_TOKEN,
    EXERCISE_RATING_REPOSITORY_TOKEN,
  ],
})
export class ExerciseModule {}
