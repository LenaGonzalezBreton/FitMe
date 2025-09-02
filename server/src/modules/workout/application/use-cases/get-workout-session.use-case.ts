import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface GetWorkoutSessionRequest {
  sessionId: string;
}

export interface GetWorkoutSessionResponse {
  id: string;
  userId: string;
  programId?: string;
  title?: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  status: string;
  notes?: string;
  rating?: number;
  exercises: Array<{
    id: string;
    exerciseId: string;
    order: number;
    sets?: number;
    reps?: string;
    weight?: number;
    duration?: number;
    restTime?: number;
    notes?: string;
    completed: boolean;
  }>;
}

@Injectable()
export class GetWorkoutSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: GetWorkoutSessionRequest): Promise<GetWorkoutSessionResponse> {
    const { sessionId } = request;

    const workoutSession = await this.workoutSessionRepository.findByIdWithExercises(sessionId);
    if (!workoutSession) {
      throw new Error('Workout session not found');
    }

    return {
      id: workoutSession.id,
      userId: workoutSession.userId,
      programId: workoutSession.programId,
      title: workoutSession.title,
      startTime: workoutSession.startTime,
      endTime: workoutSession.endTime,
      totalDuration: workoutSession.totalDuration,
      status: workoutSession.status,
      notes: workoutSession.notes,
      rating: workoutSession.rating,
      exercises: workoutSession.exercises || [],
    };
  }
}

