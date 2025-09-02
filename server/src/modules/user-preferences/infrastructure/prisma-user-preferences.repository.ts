import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { IUserPreferencesRepository } from '../domain/user-preferences.repository';
import { UserPreferencesData } from '../application/use-cases';

@Injectable()
export class PrismaUserPreferencesRepository implements IUserPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserPreferences(userId: string): Promise<UserPreferencesData> {
    const preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences if none exist
      return {
        userId,
        theme: 'AUTO',
        language: 'FRENCH',
        notifications: {
          email: true,
          push: true,
          workout: true,
          cycle: true,
          achievements: true,
        },
        privacy: {
          shareProgress: false,
          shareCycle: false,
          allowAnalytics: true,
        },
      };
    }

    return {
      userId: preferences.userId,
      theme: preferences.theme as 'LIGHT' | 'DARK' | 'AUTO',
      language: preferences.language || 'FRENCH',
      notifications: {
        email: (preferences.notifications as any)?.email ?? true,
        push: (preferences.notifications as any)?.push ?? true,
        workout: (preferences.notifications as any)?.workout ?? true,
        cycle: (preferences.notifications as any)?.cycle ?? true,
        achievements: (preferences.notifications as any)?.achievements ?? true,
      },
      privacy: {
        shareProgress: (preferences.privacy as any)?.shareProgress ?? false,
        shareCycle: (preferences.privacy as any)?.shareCycle ?? false,
        allowAnalytics: (preferences.privacy as any)?.allowAnalytics ?? true,
      },
    };
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferencesData>): Promise<void> {
    const updateData: any = {};

    if (preferences.theme !== undefined) {
      updateData.theme = preferences.theme;
    }

    if (preferences.language !== undefined) {
      updateData.language = preferences.language;
    }

    if (preferences.notifications) {
      if (preferences.notifications.email !== undefined) {
        updateData.emailNotifications = preferences.notifications.email;
      }
      if (preferences.notifications.push !== undefined) {
        updateData.pushNotifications = preferences.notifications.push;
      }
      if (preferences.notifications.workout !== undefined) {
        updateData.workoutNotifications = preferences.notifications.workout;
      }
      if (preferences.notifications.cycle !== undefined) {
        updateData.cycleNotifications = preferences.notifications.cycle;
      }
      if (preferences.notifications.achievements !== undefined) {
        updateData.achievementNotifications = preferences.notifications.achievements;
      }
    }

    if (preferences.privacy) {
      if (preferences.privacy.shareProgress !== undefined) {
        updateData.shareProgress = preferences.privacy.shareProgress;
      }
      if (preferences.privacy.shareCycle !== undefined) {
        updateData.shareCycle = preferences.privacy.shareCycle;
      }
      if (preferences.privacy.allowAnalytics !== undefined) {
        updateData.allowAnalytics = preferences.privacy.allowAnalytics;
      }
    }

    await this.prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        theme: preferences.theme || 'LIGHT',
        language: preferences.language || 'FRENCH',
        notifications: {
          email: preferences.notifications?.email ?? true,
          push: preferences.notifications?.push ?? true,
          workout: preferences.notifications?.workout ?? true,
          cycle: preferences.notifications?.cycle ?? true,
          achievements: preferences.notifications?.achievements ?? true,
        },
        units: 'METRIC',
        privacy: {
          shareProgress: preferences.privacy?.shareProgress ?? false,
          shareCycle: preferences.privacy?.shareCycle ?? false,
          allowAnalytics: preferences.privacy?.allowAnalytics ?? true,
        },
      },
    });
  }
}
