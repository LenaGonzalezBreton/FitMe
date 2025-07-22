import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FavoriteExercise } from '../../domain/exercise.entity';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
} from '../../domain/exercise.repository';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
} from '../../tokens';

export interface AddToFavoritesRequest {
  userId: string;
  exerciseId: string;
}

@Injectable()
export class AddToFavoritesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(FAVORITE_EXERCISE_REPOSITORY_TOKEN)
    private readonly favoriteExerciseRepository: IFavoriteExerciseRepository,
  ) {}

  async execute(request: AddToFavoritesRequest): Promise<FavoriteExercise> {
    // Verify the exercise exists
    const exercise = await this.exerciseRepository.findById(request.exerciseId);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with id ${request.exerciseId} not found`,
      );
    }

    // Check if already in favorites
    const existingFavorite =
      await this.favoriteExerciseRepository.findByUserAndExercise(
        request.userId,
        request.exerciseId,
      );

    if (existingFavorite) {
      throw new ConflictException('Exercise is already in favorites');
    }

    // Add to favorites
    const favorite = await this.favoriteExerciseRepository.create(
      request.userId,
      request.exerciseId,
    );

    return favorite;
  }
}
