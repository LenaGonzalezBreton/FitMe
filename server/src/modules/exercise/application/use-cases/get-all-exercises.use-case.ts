import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EXERCISE_REPOSITORY_TOKEN } from '../../tokens';
import { IExerciseRepository, ExerciseFilters } from '../../domain/exercise.repository';
import { Exercise } from '../../domain/exercise.entity';

export interface GetAllExercisesRequest {
  intensity?: string;
  muscleZone?: string;
  minDuration?: number;
  maxDuration?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetAllExercisesResponse {
  exercises: Exercise[];
  totalCount: number;
}

@Injectable()
export class GetAllExercisesUseCase {
  constructor(
    @Inject(EXERCISE_REPOSITORY_TOKEN)
    private readonly exerciseRepository: IExerciseRepository,
  ) {}

  async execute(request: GetAllExercisesRequest): Promise<GetAllExercisesResponse> {
    const filters: ExerciseFilters = {
      intensity: request.intensity as any,
      muscleZone: request.muscleZone as any,
      minDuration: request.minDuration,
      maxDuration: request.maxDuration,
      search: request.search,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof ExerciseFilters] === undefined) {
        delete filters[key as keyof ExerciseFilters];
      }
    });

    const exercises = await this.exerciseRepository.findWithFilters(filters);
    
    // Apply pagination
    const totalCount = exercises.length;
    let paginatedExercises = exercises;
    
    if (request.limit || request.offset) {
      const start = request.offset || 0;
      const end = request.limit ? start + request.limit : undefined;
      paginatedExercises = exercises.slice(start, end);
    }

    return {
      exercises: paginatedExercises,
      totalCount,
    };
  }
}
