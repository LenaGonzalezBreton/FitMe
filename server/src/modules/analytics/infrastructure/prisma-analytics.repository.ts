import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { IAnalyticsRepository } from '../domain/analytics.repository';
import { UserAnalyticsData, WorkoutAnalyticsData, CycleAnalyticsData, ProgressInsight } from '../application/use-cases';

@Injectable()
export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAnalytics(userId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<UserAnalyticsData> {
    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const workouts = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        startTime: { gte: startDate },
        status: 'COMPLETED',
      },
      include: {
        workoutExercises: true,
      },
    });

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.totalDuration || 0), 0);
    const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    
    // Calculate workout frequency (workouts per week)
    const weeks = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const workoutFrequency = totalWorkouts / weeks;

    return {
      totalWorkouts,
      totalDuration,
      averageWorkoutDuration,
      workoutFrequency,
      strengthProgress: 0, // TODO: Implement strength tracking
      cardioProgress: 0,   // TODO: Implement cardio tracking
      flexibilityProgress: 0, // TODO: Implement flexibility tracking
      consistencyScore: Math.min(100, (workoutFrequency / 3) * 100), // Assuming 3 workouts/week is ideal
    };
  }

  async getWorkoutAnalytics(userId: string, workoutId?: string, period: 'week' | 'month' | 'year' = 'month'): Promise<WorkoutAnalyticsData> {
    const now = new Date();
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to month

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        ...(workoutId && { programId: workoutId }),
        startTime: { gte: startDate },
      },
      include: {
        workoutExercises: true,
      },
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      workoutId: workoutId || '',
      totalSessions,
      averageDuration,
      completionRate,
      strengthProgress: 0, // TODO: Implement
      enduranceProgress: 0, // TODO: Implement
      flexibilityProgress: 0, // TODO: Implement
      personalBests: {}, // TODO: Implement
    };
  }

  async getCycleAnalytics(userId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<CycleAnalyticsData> {
    // TODO: Implement cycle analytics when cycle tracking is available
    return {
      totalCycles: 0,
      averageCycleLength: 28,
      cycleRegularity: 0,
      periodLength: 5,
      symptoms: {},
      energyLevels: {},
      workoutPerformance: {},
    };
  }

  async getProgressInsights(userId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ProgressInsight[]> {
    // TODO: Implement progress insights
    return [];
  }
}
