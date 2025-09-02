import { UserAnalyticsData, WorkoutAnalyticsData, CycleAnalyticsData, ProgressInsight } from '../application/use-cases';

export interface IAnalyticsRepository {
  getUserAnalytics(userId: string, period?: 'week' | 'month' | 'year'): Promise<UserAnalyticsData>;
  getWorkoutAnalytics(userId: string, workoutId?: string, period?: 'week' | 'month' | 'year'): Promise<WorkoutAnalyticsData>;
  getCycleAnalytics(userId: string, period?: 'month' | 'quarter' | 'year'): Promise<CycleAnalyticsData>;
  getProgressInsights(userId: string, period?: 'week' | 'month' | 'quarter' | 'year'): Promise<ProgressInsight[]>;
}
