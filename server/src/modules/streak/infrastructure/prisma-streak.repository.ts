import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  totalWorkouts: number;
  thisWeekWorkouts: number;
  thisMonthWorkouts: number;
}

export interface LogWorkoutData {
  userId: string;
  duration?: number;
  intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

@Injectable()
export class PrismaStreakRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStreakData(userId: string): Promise<StreakData> {
    // Get all workout sessions for the user
    const workoutSessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: { startTime: 'desc' },
    });

    if (workoutSessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        totalWorkouts: 0,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0,
      };
    }

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(workoutSessions);
    
    // Calculate longest streak
    const longestStreak = this.calculateLongestStreak(workoutSessions);
    
    // Get last workout date
    const lastWorkoutDate = workoutSessions[0].startTime.toISOString().split('T')[0];
    
    // Get total workouts
    const totalWorkouts = workoutSessions.length;
    
    // Calculate this week and month workouts
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisWeekWorkouts = workoutSessions.filter(s => s.startTime >= thisWeekStart).length;
    const thisMonthWorkouts = workoutSessions.filter(s => s.startTime >= thisMonthStart).length;

    return {
      currentStreak,
      longestStreak,
      lastWorkoutDate,
      totalWorkouts,
      thisWeekWorkouts,
      thisMonthWorkouts,
    };
  }

  async logWorkout(data: LogWorkoutData): Promise<{
    currentStreak: number;
    longestStreak: number;
    message: string;
  }> {
    // Create a workout session record for streak tracking
    const workoutSession = await this.prisma.workoutSession.create({
      data: {
        userId: data.userId,
        title: 'Streak Workout',
        startTime: new Date(),
        endTime: new Date(),
        totalDuration: data.duration || 0,
        status: 'COMPLETED',
        notes: data.notes,
      },
    });

    // Get updated streak data
    const streakData = await this.getStreakData(data.userId);

    let message = 'Workout logged successfully!';
    if (streakData.currentStreak > 1) {
      message = `Great job! You're on a ${streakData.currentStreak}-day streak!`;
    } else if (streakData.currentStreak === 1) {
      message = 'Workout logged! Start building your streak!';
    }

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      message,
    };
  }

  private calculateCurrentStreak(workoutSessions: any[]): number {
    if (workoutSessions.length === 0) return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let streak = 0;
    let currentDate = today;

    for (const session of workoutSessions) {
      const sessionDate = new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate());
      
      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(workoutSessions: any[]): number {
    if (workoutSessions.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const session of workoutSessions) {
      const sessionDate = new Date(session.startTime.getFullYear(), session.startTime.getMonth(), session.startTime.getDate());
      
      if (previousDate === null) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor((previousDate.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      
      previousDate = sessionDate;
    }

    // Check the last streak
    longestStreak = Math.max(longestStreak, currentStreak);

    return longestStreak;
  }
}


