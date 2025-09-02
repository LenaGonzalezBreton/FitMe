import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsRepository } from '../../domain/analytics.repository';
import { ANALYTICS_REPOSITORY_TOKEN } from '../../tokens';

export interface GetUserAnalyticsRequest {
  userId: string;
  period?: 'week' | 'month' | 'year';
}

export interface UserAnalyticsData {
  totalWorkouts: number;
  totalDuration: number;
  averageWorkoutDuration: number;
  workoutFrequency: number;
  strengthProgress: number;
  cardioProgress: number;
  flexibilityProgress: number;
  consistencyScore: number;
}

export interface GetUserAnalyticsResponse {
  success: boolean;
  data: UserAnalyticsData;
  message: string;
}

@Injectable()
export class GetUserAnalyticsUseCase {
  constructor(
    @Inject(ANALYTICS_REPOSITORY_TOKEN)
    private readonly analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(request: GetUserAnalyticsRequest): Promise<GetUserAnalyticsResponse> {
    try {
      const analytics = await this.analyticsRepository.getUserAnalytics(request.userId, request.period);
      
      return {
        success: true,
        data: analytics,
        message: 'Analytics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalWorkouts: 0,
          totalDuration: 0,
          averageWorkoutDuration: 0,
          workoutFrequency: 0,
          strengthProgress: 0,
          cardioProgress: 0,
          flexibilityProgress: 0,
          consistencyScore: 0,
        },
        message: error.message || 'Failed to retrieve analytics',
      };
    }
  }
}
