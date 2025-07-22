import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ExerciseRating } from '../../domain/exercise.entity';
import {
  IExerciseRepository,
  IExerciseRatingRepository,
} from '../../domain/exercise.repository';
import {
  EXERCISE_REPOSITORY_TOKEN,
  EXERCISE_RATING_REPOSITORY_TOKEN,
} from '../../tokens';

export interface RateExerciseRequest {
  userId: string;
  exerciseId: string;
  rating: number;
  comment?: string;
}

@Injectable()
export class RateExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(EXERCISE_RATING_REPOSITORY_TOKEN)
    private readonly exerciseRatingRepository: IExerciseRatingRepository,
  ) {}

  async execute(request: RateExerciseRequest): Promise<ExerciseRating> {
    // Validate rating
    if (request.rating < 1 || request.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Verify the exercise exists
    const exercise = await this.exerciseRepository.findById(request.exerciseId);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with id ${request.exerciseId} not found`,
      );
    }

    // Check if user has already rated this exercise
    const existingRating =
      await this.exerciseRatingRepository.findByUserAndExercise(
        request.userId,
        request.exerciseId,
      );

    let rating: ExerciseRating;

    if (existingRating) {
      // Update existing rating
      rating = await this.exerciseRatingRepository.update(
        request.userId,
        request.exerciseId,
        request.rating,
        request.comment,
      );
    } else {
      // Create new rating
      rating = await this.exerciseRatingRepository.create(
        request.userId,
        request.exerciseId,
        request.rating,
        request.comment,
      );
    }

    return rating;
  }
}
