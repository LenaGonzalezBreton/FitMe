import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface StartWorkoutSessionRequest {
  userId: string;
  programId?: string;
  title?: string;
}

export interface StartWorkoutSessionResponse {
  id: string;
  userId: string;
  programId?: string;
  title?: string;
  startTime: Date;
  status: string;
}

@Injectable()
export class StartWorkoutSessionUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: StartWorkoutSessionRequest): Promise<StartWorkoutSessionResponse> {
    const { userId, programId, title } = request;

    const workoutSession = await this.workoutSessionRepository.create({
      userId,
      programId,
      title: title || 'Entraînement',
      startTime: new Date(),
      status: 'ACTIVE',
    });

    return {
      id: workoutSession.id,
      userId: workoutSession.userId,
      programId: workoutSession.programId,
      title: workoutSession.title,
      startTime: workoutSession.startTime,
      status: workoutSession.status,
    };
  }
}

