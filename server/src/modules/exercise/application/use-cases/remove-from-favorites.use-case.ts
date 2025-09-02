import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
} from '../../domain/exercise.repository';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
} from '../../tokens';

export interface RemoveFromFavoritesRequest {
  userId: string;
  exerciseId: string;
}

@Injectable()
export class RemoveFromFavoritesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(FAVORITE_EXERCISE_REPOSITORY_TOKEN)
    private readonly favoriteExerciseRepository: IFavoriteExerciseRepository,
  ) {}

  async execute(request: RemoveFromFavoritesRequest): Promise<void> {
    // Verify the exercise exists
    const exercise = await this.exerciseRepository.findById(request.exerciseId);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with id ${request.exerciseId} not found`,
      );
    }

    // Check if it's in favorites
    const existingFavorite =
      await this.favoriteExerciseRepository.findByUserAndExercise(
        request.userId,
        request.exerciseId,
      );

    if (!existingFavorite) {
      throw new NotFoundException('Exercise is not in favorites');
    }

    // Remove from favorites
    await this.favoriteExerciseRepository.delete(
      request.userId,
      request.exerciseId,
    );
  }
}
