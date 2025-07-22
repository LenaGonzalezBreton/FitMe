import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  IUserSettingsRepository,
} from '../../domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../tokens';

export interface GetSettingsResponse {
  settings: {
    unitPreference: string;
    notificationEnabled: boolean;
    notificationTime?: string;
  };
  reminders: Array<{
    id: string;
    type: string;
    enabled: boolean;
    time?: string;
  }>;
  objectives: Array<{
    id: string;
    type: string;
    note?: string;
  }>;
  featureFlags: Array<{
    id: string;
    feature: string;
    isEnabled: boolean;
  }>;
}

@Injectable()
export class GetSettingsUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_SETTINGS_REPOSITORY_TOKEN)
    private readonly userSettingsRepository: IUserSettingsRepository,
  ) {}

  async execute(userId: string): Promise<GetSettingsResponse> {
    // Vérifier que l'utilisateur existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    // Récupérer tous les paramètres utilisateur
    const [settings, reminders, objectives, featureFlags] = await Promise.all([
      this.userSettingsRepository.getUserSettings(userId),
      this.userSettingsRepository.getReminderSettings(userId),
      this.userSettingsRepository.getUserObjectives(userId),
      this.userSettingsRepository.getUserFeatureFlags(userId),
    ]);

    return {
      settings: {
        unitPreference: settings?.unitPreference || 'METRIC',
        notificationEnabled: settings?.notificationEnabled ?? true,
        notificationTime: settings?.notificationTime
          ?.toTimeString()
          .slice(0, 8),
      },
      reminders: reminders.map((reminder) => ({
        id: reminder.id,
        type: reminder.type,
        enabled: reminder.enabled,
        time: reminder.time?.toTimeString().slice(0, 8),
      })),
      objectives: objectives.map((objective) => ({
        id: objective.id,
        type: objective.type,
        note: objective.note,
      })),
      featureFlags: featureFlags.map((flag) => ({
        id: flag.id,
        feature: flag.feature,
        isEnabled: flag.isEnabled,
      })),
    };
  }
}
