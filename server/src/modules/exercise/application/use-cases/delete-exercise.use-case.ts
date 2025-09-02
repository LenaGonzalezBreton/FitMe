import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IExerciseRepository } from '../../domain/exercise.repository';
import { EXERCISE_REPOSITORY_TOKEN } from '../../tokens';

export interface DeleteExerciseRequest {
  exerciseId: string;
  userId: string;
}

@Injectable()
export class DeleteExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(request: DeleteExerciseRequest): Promise<void> {
    // Validate required fields
    if (!request.exerciseId?.trim()) {
      throw new BadRequestException('Exercise ID is required');
    }

    if (!request.userId?.trim()) {
      throw new BadRequestException('User ID is required');
    }

    // Get existing exercise to verify ownership
    const existingExercise = await this.exerciseRepository.findById(request.exerciseId);
    if (!existingExercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Check if user owns this exercise
    if (existingExercise.createdBy !== request.userId) {
      throw new ForbiddenException('You can only delete your own exercises');
    }

    // Delete exercise
    await this.exerciseRepository.delete(request.exerciseId);
  }
}