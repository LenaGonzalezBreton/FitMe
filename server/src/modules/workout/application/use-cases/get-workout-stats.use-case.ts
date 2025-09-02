import { Injectable } from '@nestjs/common';
import { WORKOUT_SESSION_REPOSITORY_TOKEN } from '../../tokens';
import { Inject } from '@nestjs/common';

export interface GetWorkoutStatsRequest {
  userId: string;
  period?: 'week' | 'month' | 'year' | 'all';
  fromDate?: Date;
  toDate?: Date;
}

export interface GetWorkoutStatsResponse {
  totalSessions: number;
  totalDuration: number; // in seconds
  averageDuration: number; // in seconds
  completedSessions: number;
  pausedSessions: number;
  totalExercises: number;
  averageRating: number;
  period: string;
  fromDate: Date;
  toDate: Date;
}

@Injectable()
export class GetWorkoutStatsUseCase {
  constructor(
    @Inject(WORKOUT_SESSION_REPOSITORY_TOKEN)
    private readonly workoutSessionRepository: any,
  ) {}

  async execute(request: GetWorkoutStatsRequest): Promise<GetWorkoutStatsResponse> {
    const { userId, period = 'month', fromDate, toDate } = request;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Use provided dates if available
    if (fromDate) startDate = fromDate;
    if (toDate) endDate = toDate;

    const result = await this.workoutSessionRepository.findByUserId({
      userId,
      fromDate: startDate,
      toDate: endDate,
      limit: 1000, // Get all sessions for stats calculation
      offset: 0,
    });

    const sessions = result.sessions;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED').length;
    const pausedSessions = sessions.filter((s: any) => s.status === 'PAUSED').length;
    
    const totalDuration = sessions.reduce((sum: any, s: any) => sum + (s.totalDuration || 0), 0);
    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    const totalExercises = sessions.reduce((sum: any, s: any) => sum + (s.exerciseCount || 0), 0);
    
    const ratedSessions = sessions.filter((s: any) => s.rating && s.rating > 0);
    const averageRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum: any, s: any) => sum + (s.rating || 0), 0) / ratedSessions.length 
      : 0;

    return {
      totalSessions,
      totalDuration,
      averageDuration: Math.round(averageDuration),
      completedSessions,
      pausedSessions,
      totalExercises,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      period,
      fromDate: startDate,
      toDate: endDate,
    };
  }
}

