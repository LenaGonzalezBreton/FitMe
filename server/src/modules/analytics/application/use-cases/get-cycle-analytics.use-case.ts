import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsRepository } from '../../domain/analytics.repository';
import { ANALYTICS_REPOSITORY_TOKEN } from '../../tokens';

export interface GetCycleAnalyticsRequest {
  userId: string;
  period?: 'month' | 'quarter' | 'year';
}

export interface CycleAnalyticsData {
  totalCycles: number;
  averageCycleLength: number;
  cycleRegularity: number;
  periodLength: number;
  symptoms: Record<string, number>;
  energyLevels: Record<string, number>;
  workoutPerformance: Record<string, number>;
}

export interface GetCycleAnalyticsResponse {
  success: boolean;
  data: CycleAnalyticsData;
  message: string;
}

@Injectable()
export class GetCycleAnalyticsUseCase {
  constructor(
    @Inject(ANALYTICS_REPOSITORY_TOKEN)
    private readonly analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(request: GetCycleAnalyticsRequest): Promise<GetCycleAnalyticsResponse> {
    try {
      const analytics = await this.analyticsRepository.getCycleAnalytics(request.userId, request.period);
      
      return {
        success: true,
        data: analytics,
        message: 'Cycle analytics retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalCycles: 0,
          averageCycleLength: 28,
          cycleRegularity: 0,
          periodLength: 5,
          symptoms: {},
          energyLevels: {},
          workoutPerformance: {},
        },
        message: error.message || 'Failed to retrieve cycle analytics',
      };
    }
  }
}
