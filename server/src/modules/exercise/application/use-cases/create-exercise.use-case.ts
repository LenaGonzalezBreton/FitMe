import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Exercise } from '../../domain/exercise.entity';
import { IExerciseRepository } from '../../domain/exercise.repository';
import { EXERCISE_REPOSITORY_TOKEN } from '../../tokens';

export interface CreateExerciseRequest {
  userId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  durationMinutes?: number;
  intensity?: string;
  muscleZone?: string;
}

@Injectable()
export class CreateExerciseUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(request: CreateExerciseRequest): Promise<Exercise> {
    // Validate required fields
    if (!request.title?.trim()) {
      throw new BadRequestException('Exercise title is required');
    }

    if (!request.userId?.trim()) {
      throw new BadRequestException('User ID is required');
    }

    // Validate optional numeric fields
    if (request.durationMinutes !== undefined && request.durationMinutes <= 0) {
      throw new BadRequestException('Duration must be positive');
    }

    // Create exercise entity
    const exercise = await this.exerciseRepository.create({
      title: request.title.trim(),
      description: request.description?.trim(),
      imageUrl: request.imageUrl?.trim(),
      durationMinutes: request.durationMinutes,
      intensity: request.intensity as never, // Will be validated by Prisma enum
      muscleZone: request.muscleZone as never, // Will be validated by Prisma enum
      createdBy: request.userId,
    });

    return exercise;
  }
}
