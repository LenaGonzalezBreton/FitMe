import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  IUserSettingsRepository,
  UserSettingsData,
} from '../../domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetPreferencesResponse {
  general: {
    theme: UserSettingsData['theme'];
    language: UserSettingsData['language'];
    units: UserSettingsData['units'];
    notifications: UserSettingsData['notifications'];
    privacy: UserSettingsData['privacy'];
  };
  workouts: {
    objectives: Array<{
      id: string;
      type: string;
      note?: string;
    }>;
    reminders: Array<{
      id: string;
      type: string;
      enabled: boolean;
      time?: string;
    }>;
  };
  notifications: {
    reminders: Array<{
      id: string;
      type: string;
      enabled: boolean;
      time?: string;
    }>;
    generalEnabled: boolean;
    defaultTime?: string;
  };
}

@Injectable()
export class GetPreferencesUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_SETTINGS_REPOSITORY_TOKEN)
    private readonly userSettingsRepository: IUserSettingsRepository,
  ) {}

  async execute(userId: string): Promise<GetPreferencesResponse> {
    // Vérifier que l'utilisateur existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Récupérer tous les paramètres utilisateur
    const [settings, reminders, objectives] = await Promise.all([
      this.userSettingsRepository.getUserSettings(userId),
      this.userSettingsRepository.getReminderSettings(userId),
      this.userSettingsRepository.getUserObjectives(userId),
    ]);

    // Séparer les rappels liés aux workouts des autres
    const workoutReminderTypes = ['EXERCISE', 'WORKOUT_SCHEDULE'];
    const notificationReminderTypes = [
      'PERIOD_START',
      'OVULATION',
      'MEDICATION',
      'MOOD_TRACKING',
      'SYMPTOM_LOGGING',
      'WATER_INTAKE',
      'SLEEP_REMINDER',
    ];

    const workoutReminders = reminders.filter(
      (r) => workoutReminderTypes.includes(r.type) || r.type === 'EXERCISE',
    );

    const notificationReminders = reminders.filter((r) =>
      notificationReminderTypes.includes(r.type),
    );

    return {
      general: {
        theme: settings?.theme || 'LIGHT',
        language: settings?.language || 'FRENCH',
        units: settings?.units || 'METRIC',
        notifications: settings?.notifications || {
          email: true,
          push: true,
          workout: true,
          cycle: true,
          achievements: true,
        },
        privacy: settings?.privacy || {
          shareProgress: false,
          shareCycle: false,
          allowAnalytics: true,
        },
      },
      workouts: {
        objectives: objectives.map((objective) => ({
          id: objective.id,
          type: objective.type,
          note: objective.note,
        })),
        reminders: workoutReminders.map((reminder) => ({
          id: reminder.id,
          type: reminder.type,
          enabled: reminder.enabled,
          time: reminder.time?.toTimeString().slice(0, 8),
        })),
      },
      notifications: {
        reminders: notificationReminders.map((reminder) => ({
          id: reminder.id,
          type: reminder.type,
          enabled: reminder.enabled,
          time: reminder.time?.toTimeString().slice(0, 8),
        })),
        generalEnabled: true,
        defaultTime: undefined,
      },
    };
  }
}
