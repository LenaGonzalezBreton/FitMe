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

export interface UpdateSettingsRequest {
  userId: string;
  settings?: {
    theme?: UserSettingsData['theme'];
    language?: UserSettingsData['language'];
    units?: UserSettingsData['units'];
    notifications?: UserSettingsData['notifications'];
    privacy?: UserSettingsData['privacy'];
  };
  reminders?: Array<{
    type: string;
    enabled: boolean;
    time?: string;
  }>;
  objectives?: Array<{
    type: string;
    note?: string;
  }>;
  featureFlags?: Array<{
    feature: string;
    isEnabled: boolean;
  }>;
}

export interface UpdateSettingsResponse {
  message: string;
  settings: {
    theme: string;
    language: string;
    units: string;
    notifications: any;
    privacy: any;
  };
  updatedReminders: number;
  updatedObjectives: number;
  updatedFeatureFlags: number;
}

@Injectable()
export class UpdateSettingsUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject(USER_SETTINGS_REPOSITORY_TOKEN)
    private readonly userSettingsRepository: IUserSettingsRepository,
  ) {}

  async execute(
    request: UpdateSettingsRequest,
  ): Promise<UpdateSettingsResponse> {
    const { userId, settings, reminders, objectives, featureFlags } = request;

    // Vérifier que l'utilisateur existe
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }

    let updatedSettings;
    let updatedRemindersCount = 0;
    let updatedObjectivesCount = 0;
    let updatedFeatureFlagsCount = 0;

    // Mettre à jour les paramètres généraux
    if (settings) {
      // Valider theme si fournie
      if (
        settings.theme &&
        !['LIGHT', 'DARK', 'AUTO'].includes(settings.theme)
      ) {
        throw new Error("Thème invalide (LIGHT, DARK ou AUTO).");
      }

      // Valider language si fournie
      if (
        settings.language &&
        !['FRENCH', 'ENGLISH'].includes(settings.language)
      ) {
        throw new Error("Langue invalide (FRENCH ou ENGLISH).");
      }

      // Valider units si fournie
      if (
        settings.units &&
        !['METRIC', 'IMPERIAL'].includes(settings.units)
      ) {
        throw new Error("Préférence d'unité invalide (METRIC ou IMPERIAL).");
      }

      updatedSettings =
        await this.userSettingsRepository.createOrUpdateUserSettings(userId, {
          theme: settings.theme,
          language: settings.language,
          units: settings.units,
          notifications: settings.notifications,
          privacy: settings.privacy,
        });
    } else {
      // Récupérer les paramètres existants
      const existingSettings =
        await this.userSettingsRepository.getUserSettings(userId);
      updatedSettings = existingSettings || {
        theme: 'LIGHT',
        language: 'FRENCH',
        units: 'METRIC',
        notifications: {},
        privacy: {},
      };
    }

    // Mettre à jour les rappels
    if (reminders && reminders.length > 0) {
      const reminderTypes = [
        'PERIOD_START',
        'OVULATION',
        'EXERCISE',
        'MEDICATION',
        'MOOD_TRACKING',
        'SYMPTOM_LOGGING',
        'WATER_INTAKE',
        'SLEEP_REMINDER',
      ];

      for (const reminder of reminders) {
        if (!reminderTypes.includes(reminder.type)) {
          throw new Error(`Type de rappel invalide: ${reminder.type}`);
        }

        let reminderTime: Date | undefined;
        if (reminder.time) {
          const timeMatch = reminder.time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
          if (!timeMatch) {
            throw new Error(
              'Format de temps invalide pour le rappel (HH:MM:SS).',
            );
          }
          reminderTime = new Date();
          reminderTime.setHours(
            parseInt(timeMatch[1]),
            parseInt(timeMatch[2]),
            parseInt(timeMatch[3]),
            0,
          );
        }

        await this.userSettingsRepository.createOrUpdateReminderSetting(
          userId,
          reminder.type,
          {
            enabled: reminder.enabled,
            time: reminderTime,
          },
        );
        updatedRemindersCount++;
      }
    }

    // Mettre à jour les objectifs
    if (objectives && objectives.length > 0) {
      const objectiveTypes = [
        'WEIGHT_LOSS',
        'MUSCLE_GAIN',
        'ENDURANCE',
        'STRENGTH',
        'FLEXIBILITY',
        'GENERAL_FITNESS',
        'STRESS_REDUCTION',
        'ENERGY_BOOST',
      ];

      for (const objective of objectives) {
        if (!objectiveTypes.includes(objective.type)) {
          throw new Error(`Type d'objectif invalide: ${objective.type}`);
        }

        await this.userSettingsRepository.createOrUpdateUserObjective(
          userId,
          objective.type,
          objective.note,
        );
        updatedObjectivesCount++;
      }
    }

    // Mettre à jour les feature flags
    if (featureFlags && featureFlags.length > 0) {
      for (const flag of featureFlags) {
        await this.userSettingsRepository.createOrUpdateFeatureFlag(
          userId,
          flag.feature,
          flag.isEnabled,
        );
        updatedFeatureFlagsCount++;
      }
    }

    return {
      message: 'Paramètres mis à jour avec succès',
      settings: {
        theme: updatedSettings.theme,
        language: updatedSettings.language,
        units: updatedSettings.units,
        notifications: updatedSettings.notifications,
        privacy: updatedSettings.privacy,
      },
      updatedReminders: updatedRemindersCount,
      updatedObjectives: updatedObjectivesCount,
      updatedFeatureFlags: updatedFeatureFlagsCount,
    };
  }
}
