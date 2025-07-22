import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  IUserSettingsRepository,
} from '../../domain/auth.repository';
import {
  USER_REPOSITORY_TOKEN,
  USER_SETTINGS_REPOSITORY_TOKEN,
} from '../../tokens';

export interface UpdateSettingsRequest {
  userId: string;
  settings?: {
    unitPreference?: string;
    notificationEnabled?: boolean;
    notificationTime?: string;
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
    unitPreference: string;
    notificationEnabled: boolean;
    notificationTime?: string;
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
      // Valider unitPreference si fournie
      if (
        settings.unitPreference &&
        !['METRIC', 'IMPERIAL'].includes(settings.unitPreference)
      ) {
        throw new Error("Préférence d'unité invalide (METRIC ou IMPERIAL).");
      }

      // Valider notificationTime si fournie
      let notificationTime: Date | undefined;
      if (settings.notificationTime) {
        const timeMatch = settings.notificationTime.match(
          /^(\d{2}):(\d{2}):(\d{2})$/,
        );
        if (!timeMatch) {
          throw new Error('Format de temps invalide (HH:MM:SS).');
        }
        // Créer une date avec le temps spécifié
        notificationTime = new Date();
        notificationTime.setHours(
          parseInt(timeMatch[1]),
          parseInt(timeMatch[2]),
          parseInt(timeMatch[3]),
          0,
        );
      }

      updatedSettings =
        await this.userSettingsRepository.createOrUpdateUserSettings(userId, {
          unitPreference: settings.unitPreference,
          notificationEnabled: settings.notificationEnabled,
          notificationTime,
        });
    } else {
      // Récupérer les paramètres existants
      const existingSettings =
        await this.userSettingsRepository.getUserSettings(userId);
      updatedSettings = existingSettings || {
        unitPreference: 'METRIC',
        notificationEnabled: true,
        notificationTime: undefined,
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
        unitPreference: updatedSettings.unitPreference,
        notificationEnabled: updatedSettings.notificationEnabled,
        notificationTime: updatedSettings.notificationTime
          ?.toTimeString()
          .slice(0, 8),
      },
      updatedReminders: updatedRemindersCount,
      updatedObjectives: updatedObjectivesCount,
      updatedFeatureFlags: updatedFeatureFlagsCount,
    };
  }
}
