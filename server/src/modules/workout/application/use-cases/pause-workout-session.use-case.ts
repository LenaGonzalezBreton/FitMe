import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface PauseWorkoutSessionRequest {
  sessionId: string;
}

export interface PauseWorkoutSessionResponse {
  id: string;
  status: string;
  pausedAt: Date;
}

@Injectable()
export class PauseWorkoutSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: PauseWorkoutSessionRequest): Promise<PauseWorkoutSessionResponse> {
    const { sessionId } = request;

    const workoutSession = await this.workoutSessionRepository.findById(sessionId);
    if (!workoutSession) {
      throw new Error('Workout session not found');
    }

    if (workoutSession.status !== 'ACTIVE') {
      throw new Error('Workout session is not active');
    }

    const pausedAt = new Date();
    const updatedSession = await this.workoutSessionRepository.update(sessionId, {
      status: 'PAUSED',
    });

    return {
      id: updatedSession.id,
      status: updatedSession.status,
      pausedAt,
    };
  }
}

