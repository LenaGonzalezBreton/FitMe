import { Injectable } from '@nestjs/common';
import { STREAK_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface LogWorkoutRequest {
  userId: string;
  duration?: number;
  intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface LogWorkoutResponse {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  message: string;
}

@Injectable()
export class LogWorkoutUseCase {
  constructor(
    @Inject(STREAK_REPOSITORY_TOKEN)
    private readonly streakRepository: any,
  ) {}

  async execute(request: LogWorkoutRequest): Promise<LogWorkoutResponse> {
    const { userId, duration, intensity, notes } = request;

    const result = await this.streakRepository.logWorkout({
      userId,
      duration,
      intensity,
      notes,
    });

    return {
      success: true,
      currentStreak: result.currentStreak,
      longestStreak: result.longestStreak,
      message: result.message,
    };
  }
}


