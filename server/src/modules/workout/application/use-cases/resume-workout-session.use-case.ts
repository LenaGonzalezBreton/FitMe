import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface ResumeWorkoutSessionRequest {
  sessionId: string;
}

export interface ResumeWorkoutSessionResponse {
  id: string;
  status: string;
  resumedAt: Date;
}

@Injectable()
export class ResumeWorkoutSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: ResumeWorkoutSessionRequest): Promise<ResumeWorkoutSessionResponse> {
    const { sessionId } = request;

    const workoutSession = await this.workoutSessionRepository.findById(sessionId);
    if (!workoutSession) {
      throw new Error('Workout session not found');
    }

    if (workoutSession.status !== 'PAUSED') {
      throw new Error('Workout session is not paused');
    }

    const resumedAt = new Date();
    const updatedSession = await this.workoutSessionRepository.update(sessionId, {
      status: 'ACTIVE',
    });

    return {
      id: updatedSession.id,
      status: updatedSession.status,
      resumedAt,
    };
  }
}

