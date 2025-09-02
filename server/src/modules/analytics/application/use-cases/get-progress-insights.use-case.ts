import { Injectable, Inject } from '@nestjs/common';
import { IAnalyticsRepository } from '../../domain/analytics.repository';
import { ANALYTICS_REPOSITORY_TOKEN } from '../../tokens';

export interface GetProgressInsightsRequest {
  userId: string;
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export interface ProgressInsight {
  id: string;
  type: 'strength' | 'endurance' | 'flexibility' | 'consistency' | 'goal';
  title: string;
  description: string;
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
}

export interface GetProgressInsightsResponse {
  success: boolean;
  data: ProgressInsight[];
  message: string;
}

@Injectable()
export class GetProgressInsightsUseCase {
  constructor(
    @Inject(ANALYTICS_REPOSITORY_TOKEN)
    private readonly analyticsRepository: IAnalyticsRepository
  ) {}

  async execute(request: GetProgressInsightsRequest): Promise<GetProgressInsightsResponse> {
    try {
      const insights = await this.analyticsRepository.getProgressInsights(request.userId, request.period);
      
      return {
        success: true,
        data: insights,
        message: 'Progress insights retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to retrieve progress insights',
      };
    }
  }
}
