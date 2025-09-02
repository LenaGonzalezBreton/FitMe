import { Injectable } from '@nestjs/common';
import { WORKOUT_EXERCISE_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface LogExerciseCompletionRequest {
  sessionId: string;
  exerciseId: string;
  sets?: number;
  reps?: string;
  weight?: number;
  duration?: number;
  notes?: string;
}

export interface LogExerciseCompletionResponse {
  id: string;
  workoutSessionId: string;
  exerciseId: string;
  order: number;
  sets?: number;
  reps?: string;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  completed: boolean;
}

@Injectable()
export class LogExerciseCompletionUseCase {
  constructor(
    @Inject(WORKOUT_EXERCISE_REPOSITORY_TOKEN)
    private readonly workoutExerciseRepository: any,
  ) {}

  async execute(request: LogExerciseCompletionRequest): Promise<LogExerciseCompletionResponse> {
    const { sessionId, exerciseId, sets, reps, weight, duration, notes } = request;

    // Get the next order number for this session
    const existingExercises = await this.workoutExerciseRepository.findBySessionId(sessionId);
    const nextOrder = existingExercises.length + 1;

    const workoutExercise = await this.workoutExerciseRepository.create({
      workoutSessionId: sessionId,
      exerciseId,
      order: nextOrder,
      sets,
      reps,
      weight,
      duration,
      notes,
      completed: false,
    });

    return {
      id: workoutExercise.id,
      workoutSessionId: workoutExercise.workoutSessionId,
      exerciseId: workoutExercise.exerciseId,
      order: workoutExercise.order,
      sets: workoutExercise.sets,
      reps: workoutExercise.reps,
      weight: workoutExercise.weight,
      duration: workoutExercise.duration,
      restTime: workoutExercise.restTime,
      notes: workoutExercise.notes,
      completed: workoutExercise.completed,
    };
  }
}

