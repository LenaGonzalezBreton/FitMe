import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Exercise } from '../../domain/exercise.entity';
import { IExerciseRepository } from '../../domain/exercise.repository';
import { EXERCISE_REPOSITORY_TOKEN } from '../../tokens';

export interface UpdateExerciseRequest {
  exerciseId: string;
  userId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  duration?: number;
  intensity?: string;
  muscleZone?: string;
}

@Injectable()
export class UpdateExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(request: UpdateExerciseRequest): Promise<Exercise> {
    // Validate required fields
    if (!request.exerciseId?.trim()) {
      throw new BadRequestException('Exercise ID is required');
    }

    if (!request.userId?.trim()) {
      throw new BadRequestException('User ID is required');
    }

    // Get existing exercise
    const existingExercise = await this.exerciseRepository.findById(request.exerciseId);
    if (!existingExercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Check if user owns this exercise
    if (existingExercise.createdBy !== request.userId) {
      throw new ForbiddenException('You can only update your own exercises');
    }

    // Validate optional fields
    if (request.title !== undefined && !request.title?.trim()) {
      throw new BadRequestException('Exercise title cannot be empty');
    }

    if (request.duration !== undefined && request.duration <= 0) {
      throw new BadRequestException('Duration must be positive');
    }

    // Prepare update data
    const updateData: any = {};
    if (request.title !== undefined) {
      updateData.title = request.title.trim();
    }
    if (request.description !== undefined) {
      updateData.description = request.description?.trim();
    }
    if (request.imageUrl !== undefined) {
      updateData.imageUrl = request.imageUrl?.trim();
    }
    if (request.duration !== undefined) {
      updateData.duration = request.duration;
    }
    if (request.intensity !== undefined) {
      updateData.intensity = request.intensity;
    }
    if (request.muscleZone !== undefined) {
      updateData.muscleZone = request.muscleZone;
    }

    // Update exercise
    const updatedExercise = await this.exerciseRepository.update(request.exerciseId, updateData);
    if (!updatedExercise) {
      throw new NotFoundException('Exercise not found after update');
    }

    return updatedExercise;
  }
}