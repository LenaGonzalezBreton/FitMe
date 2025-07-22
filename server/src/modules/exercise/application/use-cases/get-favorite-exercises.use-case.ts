import { Injectable, Inject } from '@nestjs/common';
import { Exercise, FavoriteExercise } from '../../domain/exercise.entity';
import {
  IExerciseRepository,
  IFavoriteExerciseRepository,
  IExerciseRatingRepository,
} from '../../domain/exercise.repository';
import {
  EXERCISE_REPOSITORY_TOKEN,
  FAVORITE_EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetFavoriteExercisesRequest {
  userId: string;
}

export interface FavoriteExerciseWithDetails {
  exercise: Exercise;
  addedToFavoritesAt: Date;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

@Injectable()
export class GetFavoriteExercisesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(FAVORITE_EXERCISE_REPOSITORY_TOKEN)
    private readonly favoriteExerciseRepository: IFavoriteExerciseRepository,
    @Inject(EXERCISE_RATING_REPOSITORY_TOKEN)
    private readonly exerciseRatingRepository: IExerciseRatingRepository,
  ) {}

  async execute(
    request: GetFavoriteExercisesRequest,
  ): Promise<FavoriteExerciseWithDetails[]> {
    // Get user's favorite exercises
    const favorites = await this.favoriteExerciseRepository.findByUserId(
      request.userId,
    );

    // Get detailed information for each favorite exercise
    const favoriteExercisesWithDetails = await Promise.all(
      favorites.map(async (favorite: FavoriteExercise) => {
        // Get exercise details
        const exercise = await this.exerciseRepository.findById(
          favorite.exerciseId,
        );

        if (!exercise) {
          // Skip if exercise no longer exists
          return null;
        }

        // Get rating information
        const [averageRating, totalRatings, userRating] = await Promise.all([
          this.exerciseRatingRepository.getAverageRating(favorite.exerciseId),
          this.exerciseRatingRepository.countRatingsByExercise(
            favorite.exerciseId,
          ),
          this.exerciseRatingRepository.findByUserAndExercise(
            request.userId,
            favorite.exerciseId,
          ),
        ]);

        return {
          exercise,
          addedToFavoritesAt: favorite.createdAt!,
          averageRating: Math.round((averageRating || 0) * 10) / 10, // Round to 1 decimal place
          totalRatings: totalRatings || 0,
          userRating: userRating?.rating,
        } as FavoriteExerciseWithDetails;
      }),
    );

    // Filter out null values (exercises that no longer exist)
    return favoriteExercisesWithDetails.filter(
      (item): item is FavoriteExerciseWithDetails => item !== null,
    );
  }
}
