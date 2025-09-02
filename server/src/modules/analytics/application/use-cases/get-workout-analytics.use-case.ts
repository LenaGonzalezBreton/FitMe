import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsRepository } from '../../domain/analytics.repository';
import { ANALYTICS_REPOSITORY_TOKEN } from '../../tokens';

export interface GetWorkoutAnalyticsRequest {
  userId: string;
  workoutId?: string;
  period?: 'week' | 'month' | 'year';
}

export interface WorkoutAnalyticsData {
  workoutId: string;
  totalSessions: number;
  averageDuration: number;
  completionRate: number;
  strengthProgress: number;
  enduranceProgress: number;
  flexibilityProgress: number;
  personalBests: Record<string, number>;
}

export interface GetWorkoutAnalyticsResponse {
  success: boolean;
  data: WorkoutAnalyticsData;
  message: string;
}

@Injectable()
export class GetWorkoutAnalyticsUseCase {
  constructor(
    @Inject(ANALYTICS_REPOSITORY_TOKEN)
    private readonly analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(request: GetWorkoutAnalyticsRequest): Promise<GetWorkoutAnalyticsResponse> {
    try {
      const analytics = await this.analyticsRepository.getWorkoutAnalytics(
        request.userId,
        request.workoutId,
        request.period
      );
      
      return {
        success: true,
        data: analytics,
        message: 'Workout analytics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          workoutId: request.workoutId || '',
          totalSessions: 0,
          averageDuration: 0,
          completionRate: 0,
          strengthProgress: 0,
          enduranceProgress: 0,
          flexibilityProgress: 0,
          personalBests: {},
        },
        message: error.message || 'Failed to retrieve workout analytics',
      };
    }
  }
}
