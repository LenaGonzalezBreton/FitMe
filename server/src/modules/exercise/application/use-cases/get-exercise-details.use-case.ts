import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Exercise } from '../../domain/exercise.entity';
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

export interface GetExerciseDetailsRequest {
  exerciseId: string;
  userId?: string; // Optional to check if it's a favorite
}

export interface GetExerciseDetailsResponse {
  exercise: Exercise;
  isFavorite: boolean;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

@Injectable()
export class GetExerciseDetailsUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(FAVORITE_EXERCISE_REPOSITORY_TOKEN)
    private readonly favoriteExerciseRepository: IFavoriteExerciseRepository,
    @Inject(EXERCISE_RATING_REPOSITORY_TOKEN)
    private readonly exerciseRatingRepository: IExerciseRatingRepository,
  ) {}

  async execute(
    request: GetExerciseDetailsRequest,
  ): Promise<GetExerciseDetailsResponse> {
    const exercise = await this.exerciseRepository.findById(request.exerciseId);

    if (!exercise) {
      throw new NotFoundException(
        `Exercise with id ${request.exerciseId} not found`,
      );
    }

    // Get rating statistics
    const averageRating = await this.exerciseRatingRepository.getAverageRating(
      request.exerciseId,
    );
    const totalRatings =
      await this.exerciseRatingRepository.countRatingsByExercise(
        request.exerciseId,
      );

    // Check if it's a favorite and get user rating (if user is provided)
    let isFavorite = false;
    let userRating: number | undefined;

    if (request.userId) {
      isFavorite = await this.favoriteExerciseRepository.exists(
        request.userId,
        request.exerciseId,
      );

      const userRatingRecord =
        await this.exerciseRatingRepository.findByUserAndExercise(
          request.userId,
          request.exerciseId,
        );
      userRating = userRatingRecord?.rating;
    }

    return {
      exercise,
      isFavorite,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings,
      userRating,
    };
  }
}
