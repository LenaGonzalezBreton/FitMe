import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import {
  IUserSettingsRepository,
  UserSettingsData,
  ReminderSettingsData,
  UserObjectiveData,
  UserFeatureFlagData,
} from '../domain/auth.repository';
import { $Enums } from '@prisma/client';

@Injectable()
export class PrismaUserSettingsRepository implements IUserSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettings(userId: string): Promise<UserSettingsData | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    return settings
      ? {
          id: settings.id,
          userId: settings.userId,
          unitPreference: settings.unitPreference,
          notificationEnabled: settings.notificationEnabled,
          notificationTime: settings.notificationTime || undefined,
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt,
        }
      : null;
  }

  async createOrUpdateUserSettings(
    userId: string,
    data: Partial<UserSettingsData>,
  ): Promise<UserSettingsData> {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        unitPreference:
          (data.unitPreference as $Enums.UnitPreference) ||
          $Enums.UnitPreference.METRIC,
        notificationEnabled: data.notificationEnabled ?? true,
        notificationTime: data.notificationTime,
      },
      update: {
        unitPreference: data.unitPreference as $Enums.UnitPreference,
        notificationEnabled: data.notificationEnabled,
        notificationTime: data.notificationTime,
      },
    });

    return {
      id: settings.id,
      userId: settings.userId,
      unitPreference: settings.unitPreference,
      notificationEnabled: settings.notificationEnabled,
      notificationTime: settings.notificationTime || undefined,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async getReminderSettings(userId: string): Promise<ReminderSettingsData[]> {
    const reminders = await this.prisma.reminderSettings.findMany({
      where: { userId },
      orderBy: { type: 'asc' },
    });

    return reminders.map((reminder) => ({
      id: reminder.id,
      userId: reminder.userId,
      type: reminder.type,
      enabled: reminder.enabled,
      time: reminder.time || undefined,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    }));
  }

  async createOrUpdateReminderSetting(
    userId: string,
    type: string,
    data: Partial<ReminderSettingsData>,
  ): Promise<ReminderSettingsData> {
    // Chercher un reminder existant
    const existingReminder = await this.prisma.reminderSettings.findFirst({
      where: { userId, type: type as $Enums.ReminderType },
    });

    let reminder;
    if (existingReminder) {
      // Mise à jour
      reminder = await this.prisma.reminderSettings.update({
        where: { id: existingReminder.id },
        data: {
          enabled: data.enabled,
          time: data.time,
        },
      });
    } else {
      // Création
      reminder = await this.prisma.reminderSettings.create({
        data: {
          userId,
          type: type as $Enums.ReminderType,
          enabled: data.enabled ?? true,
          time: data.time,
        },
      });
    }

    return {
      id: reminder.id,
      userId: reminder.userId,
      type: reminder.type,
      enabled: reminder.enabled,
      time: reminder.time || undefined,
      createdAt: reminder.createdAt,
      updatedAt: reminder.updatedAt,
    };
  }

  async getUserObjectives(userId: string): Promise<UserObjectiveData[]> {
    const objectives = await this.prisma.userObjective.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return objectives.map((objective) => ({
      id: objective.id,
      userId: objective.userId,
      type: objective.type,
      note: objective.note || undefined,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt,
    }));
  }

  async createOrUpdateUserObjective(
    userId: string,
    type: string,
    note?: string,
  ): Promise<UserObjectiveData> {
    // Chercher un objectif existant
    const existingObjective = await this.prisma.userObjective.findFirst({
      where: { userId, type: type as $Enums.ObjectiveType },
    });

    let objective;
    if (existingObjective) {
      // Mise à jour
      objective = await this.prisma.userObjective.update({
        where: { id: existingObjective.id },
        data: { note },
      });
    } else {
      // Création
      objective = await this.prisma.userObjective.create({
        data: {
          userId,
          type: type as $Enums.ObjectiveType,
          note,
        },
      });
    }

    return {
      id: objective.id,
      userId: objective.userId,
      type: objective.type,
      note: objective.note || undefined,
      createdAt: objective.createdAt,
      updatedAt: objective.updatedAt,
    };
  }

  async getUserFeatureFlags(userId: string): Promise<UserFeatureFlagData[]> {
    const flags = await this.prisma.userFeatureFlag.findMany({
      where: { userId },
      orderBy: { feature: 'asc' },
    });

    return flags.map((flag) => ({
      id: flag.id,
      userId: flag.userId,
      feature: flag.feature,
      isEnabled: flag.isEnabled,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    }));
  }

  async createOrUpdateFeatureFlag(
    userId: string,
    feature: string,
    isEnabled: boolean,
  ): Promise<UserFeatureFlagData> {
    // Chercher un feature flag existant
    const existingFlag = await this.prisma.userFeatureFlag.findFirst({
      where: { userId, feature },
    });

    let flag;
    if (existingFlag) {
      // Mise à jour
      flag = await this.prisma.userFeatureFlag.update({
        where: { id: existingFlag.id },
        data: { isEnabled },
      });
    } else {
      // Création
      flag = await this.prisma.userFeatureFlag.create({
        data: {
          userId,
          feature,
          isEnabled,
        },
      });
    }

    return {
      id: flag.id,
      userId: flag.userId,
      feature: flag.feature,
      isEnabled: flag.isEnabled,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}
