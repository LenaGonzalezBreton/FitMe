import { Injectable } from '@nestjs/common';
import { STREAK_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface GetStreakDataRequest {
  userId: string;
}

export interface GetStreakDataResponse {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
}

@Injectable()
export class GetStreakDataUseCase {
  constructor(
    @Inject(STREAK_REPOSITORY_TOKEN)
    private readonly streakRepository: any,
  ) {}

  async execute(request: GetStreakDataRequest): Promise<GetStreakDataResponse> {
    const { userId } = request;

    const streakData = await this.streakRepository.getStreakData(userId);

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      lastWorkoutDate: streakData.lastWorkoutDate,
      totalWorkouts: streakData.totalWorkouts,
      thisWeekWorkouts: streakData.thisWeekWorkouts,
      thisMonthWorkouts: streakData.thisMonthWorkouts,
    };
  }
}


