import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUserAnalyticsUseCase } from '../application/use-cases/get-user-analytics.use-case';
import { GetWorkoutAnalyticsUseCase } from '../application/use-cases/get-workout-analytics.use-case';
import { GetCycleAnalyticsUseCase } from '../application/use-cases/get-cycle-analytics.use-case';
import { GetProgressInsightsUseCase } from '../application/use-cases/get-progress-insights.use-case';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getUserAnalyticsUseCase: GetUserAnalyticsUseCase,
    private readonly getWorkoutAnalyticsUseCase: GetWorkoutAnalyticsUseCase,
    private readonly getCycleAnalyticsUseCase: GetCycleAnalyticsUseCase,
    private readonly getProgressInsightsUseCase: GetProgressInsightsUseCase,
  ) {}

  @Get('user')
  async getUserAnalytics(
    @Request() req: any,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.getUserAnalyticsUseCase.execute({
      userId: req.user.id,
      period,
    });
  }

  @Get('workout')
  async getWorkoutAnalytics(
    @Request() req: any,
    @Query('workoutId') workoutId?: string,
    @Query('period') period?: 'week' | 'month' | 'year',
  ) {
    return this.getWorkoutAnalyticsUseCase.execute({
      userId: req.user.id,
      workoutId,
      period,
    });
  }

  @Get('cycle')
  async getCycleAnalytics(
    @Request() req: any,
    @Query('period') period?: 'month' | 'quarter' | 'year',
  ) {
    return this.getCycleAnalyticsUseCase.execute({
      userId: req.user.id,
      period,
    });
  }

  @Get('insights')
  async getProgressInsights(
    @Request() req: any,
    @Query('period') period?: 'week' | 'month' | 'quarter' | 'year',
  ) {
    return this.getProgressInsightsUseCase.execute({
      userId: req.user.id,
      period,
    });
  }
}
