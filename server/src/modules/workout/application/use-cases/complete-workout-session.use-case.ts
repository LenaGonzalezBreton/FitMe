import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface CompleteWorkoutSessionRequest {
  sessionId: string;
  notes?: string;
  rating?: number;
}

export interface CompleteWorkoutSessionResponse {
  id: string;
  endTime: Date;
  totalDuration: number;
  status: string;
  notes?: string;
  rating?: number;
}

@Injectable()
export class CompleteWorkoutSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: CompleteWorkoutSessionRequest): Promise<CompleteWorkoutSessionResponse> {
    const { sessionId, notes, rating } = request;

    const workoutSession = await this.workoutSessionRepository.findById(sessionId);
    if (!workoutSession) {
      throw new Error('Workout session not found');
    }

    const endTime = new Date();
    const totalDuration = Math.floor((endTime.getTime() - workoutSession.startTime.getTime()) / 1000);

    const updatedSession = await this.workoutSessionRepository.update(sessionId, {
      endTime,
      totalDuration,
      status: 'COMPLETED',
      notes,
      rating,
    });

    return {
      id: updatedSession.id,
      endTime: updatedSession.endTime,
      totalDuration: updatedSession.totalDuration,
      status: updatedSession.status,
      notes: updatedSession.notes,
      rating: updatedSession.rating,
    };
  }
}

