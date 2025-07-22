import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { ObjectiveType, ExperienceLevel } from '../../domain/auth.repository';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @ApiProperty({
    example: 'motdepasse123',
    minLength: 8,
    description: 'Mot de passe (min 8 caractères)',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @ApiProperty({
    example: 'Jane',
    required: false,
    description: 'Prénom',
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @ApiProperty({
    example: 'FEMALE',
    required: false,
    description: 'Type de profil',
  })
  @IsOptional()
  @IsString({ message: 'Le type de profil doit être une chaîne de caractères' })
  profileType?: string;

  @ApiProperty({
    example: 'CYCLE',
    required: false,
    description: 'Type de contexte',
  })
  @IsOptional()
  @IsString({
    message: 'Le type de contexte doit être une chaîne de caractères',
  })
  contextType?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Adresse email',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  email: string;

  @ApiProperty({
    example: 'motdepasse123',
    description: 'Mot de passe',
  })
  @IsString({ message: 'Le mot de passe est requis' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Token de rafraîchissement JWT',
  })
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({
    type: () => ({
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      expiresIn: { type: 'number', example: 900 },
    }),
    description: 'Tokens JWT retournés après authentification',
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  @ApiProperty({
    type: () => ({
      id: { type: 'string', example: 'cuid_example' },
      email: { type: 'string', example: 'user@example.com' },
      firstName: { type: 'string', example: 'Jane' },
      profileType: { type: 'string', example: 'FEMALE' },
      contextType: { type: 'string', example: 'CYCLE' },
      onboardingCompleted: { type: 'boolean', example: false },
      experienceLevel: { type: 'string', example: 'INTERMEDIATE' },
    }),
    description: 'Informations utilisateur',
  })
  user: {
    id: string;
    email: string;
    firstName?: string;
    profileType?: string;
    contextType?: string;
    onboardingCompleted: boolean;
    experienceLevel?: string;
  };
}

export class TokenResponseDto {
  @ApiProperty({
    type: () => ({
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      expiresIn: { type: 'number', example: 900 },
    }),
    description: 'Tokens JWT retournés après rafraîchissement',
  })
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class UpdateProfileDto {
  @ApiProperty({
    example: 'Jane',
    required: false,
    description: 'Prénom',
  })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  firstName?: string;

  @ApiProperty({
    example: '1990-05-15',
    required: false,
    description: 'Date de naissance (format YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (YYYY-MM-DD)' })
  birthDate?: string;

  @ApiProperty({
    example: 'FEMALE',
    required: false,
    description: 'Type de profil (FEMALE, MALE, NON_BINARY, OTHER)',
    enum: ['FEMALE', 'MALE', 'NON_BINARY', 'OTHER'],
  })
  @IsOptional()
  @IsString({ message: 'Le type de profil doit être une chaîne de caractères' })
  profileType?: string;

  @ApiProperty({
    example: 'CYCLE',
    required: false,
    description: 'Type de contexte (CYCLE, GENERAL, MENOPAUSE, NONE)',
    enum: ['CYCLE', 'GENERAL', 'MENOPAUSE', 'NONE'],
  })
  @IsOptional()
  @IsString({
    message: 'Le type de contexte doit être une chaîne de caractères',
  })
  contextType?: string;

  @ApiProperty({
    example: 'WEIGHT_LOSS',
    required: false,
    description: 'Objectif principal',
  })
  @IsOptional()
  @IsString({ message: "L'objectif doit être une chaîne de caractères" })
  objective?: string;

  @ApiProperty({
    example: '3_TIMES_WEEK',
    required: false,
    description: 'Fréquence de sport',
  })
  @IsOptional()
  @IsString({
    message: 'La fréquence de sport doit être une chaîne de caractères',
  })
  sportFrequency?: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Statut ménopause',
  })
  @IsOptional()
  @IsBoolean({ message: 'Le statut ménopause doit être un booléen' })
  isMenopausal?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'ancienMotDePasse123',
    description: 'Mot de passe actuel',
  })
  @IsString({ message: 'Le mot de passe actuel est requis' })
  currentPassword: string;

  @ApiProperty({
    example: 'nouveauMotDePasse123',
    minLength: 8,
    description: 'Nouveau mot de passe (min 8 caractères)',
  })
  @IsString({
    message: 'Le nouveau mot de passe doit être une chaîne de caractères',
  })
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
  })
  newPassword: string;
}

export class ProfileResponseDto {
  @ApiProperty({
    type: () => ({
      id: { type: 'string', example: 'cuid_example' },
      email: { type: 'string', example: 'user@example.com' },
      firstName: { type: 'string', example: 'Jane' },
      birthDate: { type: 'string', example: '1990-05-15' },
      profileType: { type: 'string', example: 'FEMALE' },
      contextType: { type: 'string', example: 'CYCLE' },
      objective: { type: 'string', example: 'WEIGHT_LOSS' },
      sportFrequency: { type: 'string', example: '3_TIMES_WEEK' },
      isMenopausal: { type: 'boolean', example: false },
    }),
    description: 'Profil utilisateur complet',
  })
  user: {
    id: string;
    email: string;
    firstName?: string;
    birthDate?: string;
    profileType?: string;
    contextType?: string;
    objective?: string;
    sportFrequency?: string;
    onboardingCompleted?: boolean;
    experienceLevel?: string;
    isMenopausal?: boolean;
  };
}

export class SettingsResponseDto {
  @ApiProperty({
    type: () => ({
      unitPreference: {
        type: 'string',
        example: 'METRIC',
        enum: ['METRIC', 'IMPERIAL'],
      },
      notificationEnabled: { type: 'boolean', example: true },
      notificationTime: { type: 'string', example: '08:00:00' },
    }),
    description: "Paramètres généraux de l'utilisateur",
  })
  settings: {
    unitPreference: string;
    notificationEnabled: boolean;
    notificationTime?: string;
  };

  @ApiProperty({
    type: () => [
      {
        id: { type: 'string', example: 'cuid_example' },
        type: { type: 'string', example: 'PERIOD_START' },
        enabled: { type: 'boolean', example: true },
        time: { type: 'string', example: '08:00:00' },
      },
    ],
    description: 'Paramètres de rappels',
  })
  reminders: Array<{
    id: string;
    type: string;
    enabled: boolean;
    time?: string;
  }>;

  @ApiProperty({
    type: () => [
      {
        id: { type: 'string', example: 'cuid_example' },
        type: { type: 'string', example: 'WEIGHT_LOSS' },
        note: { type: 'string', example: 'Perdre 5kg en 3 mois' },
      },
    ],
    description: "Objectifs de l'utilisateur",
  })
  objectives: Array<{
    id: string;
    type: string;
    note?: string;
  }>;

  @ApiProperty({
    type: () => [
      {
        id: { type: 'string', example: 'cuid_example' },
        feature: { type: 'string', example: 'ADVANCED_ANALYTICS' },
        isEnabled: { type: 'boolean', example: true },
      },
    ],
    description: 'Flags de fonctionnalités',
  })
  featureFlags: Array<{
    id: string;
    feature: string;
    isEnabled: boolean;
  }>;
}

export class UpdateSettingsDto {
  @ApiProperty({
    type: () => ({
      unitPreference: {
        type: 'string',
        example: 'METRIC',
        enum: ['METRIC', 'IMPERIAL'],
      },
      notificationEnabled: { type: 'boolean', example: true },
      notificationTime: { type: 'string', example: '08:00:00' },
    }),
    required: false,
    description: 'Paramètres généraux à mettre à jour',
  })
  @IsOptional()
  settings?: {
    unitPreference?: string;
    notificationEnabled?: boolean;
    notificationTime?: string;
  };

  @ApiProperty({
    required: false,
    description: 'Rappels à mettre à jour',
    example: [
      {
        type: 'PERIOD_START',
        enabled: true,
        time: '08:00:00',
      },
    ],
  })
  @IsOptional()
  reminders?: Array<{
    type: string;
    enabled: boolean;
    time?: string;
  }>;

  @ApiProperty({
    required: false,
    description: 'Objectifs à mettre à jour',
    example: [
      {
        type: 'WEIGHT_LOSS',
        note: 'Perdre 5kg en 3 mois',
      },
    ],
  })
  @IsOptional()
  objectives?: Array<{
    type: string;
    note?: string;
  }>;

  @ApiProperty({
    required: false,
    description: 'Flags de fonctionnalités à mettre à jour',
    example: [
      {
        feature: 'ADVANCED_ANALYTICS',
        isEnabled: true,
      },
    ],
  })
  @IsOptional()
  featureFlags?: Array<{
    feature: string;
    isEnabled: boolean;
  }>;
}

export class UpdateSettingsResponseDto {
  @ApiProperty({
    example: 'Paramètres mis à jour avec succès',
    description: 'Message de confirmation',
  })
  message: string;

  @ApiProperty({
    type: () => ({
      unitPreference: { type: 'string', example: 'METRIC' },
      notificationEnabled: { type: 'boolean', example: true },
      notificationTime: { type: 'string', example: '08:00:00' },
    }),
    description: 'Paramètres généraux mis à jour',
  })
  settings: {
    unitPreference: string;
    notificationEnabled: boolean;
    notificationTime?: string;
  };

  @ApiProperty({
    example: 2,
    description: 'Nombre de rappels mis à jour',
  })
  updatedReminders: number;

  @ApiProperty({
    example: 1,
    description: "Nombre d'objectifs mis à jour",
  })
  updatedObjectives: number;

  @ApiProperty({
    example: 3,
    description: 'Nombre de feature flags mis à jour',
  })
  updatedFeatureFlags: number;
}

export class PreferencesResponseDto {
  @ApiProperty({
    type: () => ({
      unitPreference: {
        type: 'string',
        example: 'METRIC',
        enum: ['METRIC', 'IMPERIAL'],
      },
      notificationEnabled: { type: 'boolean', example: true },
      notificationTime: { type: 'string', example: '08:00:00' },
    }),
    description: 'Préférences générales',
  })
  general: {
    unitPreference: string;
    notificationEnabled: boolean;
    notificationTime?: string;
  };

  @ApiProperty({
    description: "Préférences d'entraînement",
    example: {
      objectives: [
        {
          id: 'cuid_example',
          type: 'WEIGHT_LOSS',
          note: 'Perdre 5kg en 3 mois',
        },
      ],
      reminders: [
        {
          id: 'cuid_example',
          type: 'EXERCISE',
          enabled: true,
          time: '08:00:00',
        },
      ],
    },
  })
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

  @ApiProperty({
    description: 'Préférences de notifications',
    example: {
      reminders: [
        {
          id: 'cuid_example',
          type: 'PERIOD_START',
          enabled: true,
          time: '08:00:00',
        },
      ],
      generalEnabled: true,
      defaultTime: '08:00:00',
    },
  })
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

export class UpdateWorkoutPreferencesDto {
  @ApiProperty({
    required: false,
    description: "Objectifs d'entraînement à mettre à jour",
    example: [
      {
        type: 'WEIGHT_LOSS',
        note: 'Perdre 5kg en 3 mois',
      },
    ],
  })
  @IsOptional()
  objectives?: Array<{
    type: string;
    note?: string;
  }>;

  @ApiProperty({
    required: false,
    description: "Rappels d'entraînement à mettre à jour",
    example: [
      {
        type: 'EXERCISE',
        enabled: true,
        time: '08:00:00',
      },
    ],
  })
  @IsOptional()
  reminders?: Array<{
    type: string;
    enabled: boolean;
    time?: string;
  }>;
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'Activer/désactiver les notifications générales',
  })
  @IsOptional()
  @IsBoolean()
  generalEnabled?: boolean;

  @ApiProperty({
    example: '08:00:00',
    required: false,
    description: 'Heure par défaut des notifications (HH:MM:SS)',
  })
  @IsOptional()
  @IsString()
  defaultTime?: string;

  @ApiProperty({
    required: false,
    description: 'Rappels de notifications à mettre à jour',
    example: [
      {
        type: 'PERIOD_START',
        enabled: true,
        time: '08:00:00',
      },
    ],
  })
  @IsOptional()
  reminders?: Array<{
    type: string;
    enabled: boolean;
    time?: string;
  }>;
}

export class OnboardingDto {
  @ApiProperty({
    enum: ObjectiveType,
    example: ObjectiveType.GENERAL_FITNESS,
    description: "Objectif principal de l'utilisateur",
  })
  @IsEnum(ObjectiveType)
  objective: ObjectiveType;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.INTERMEDIATE,
    description: "Niveau d'expérience sportive de l'utilisateur",
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @ApiProperty({
    example: false,
    description: "Indique si l'utilisatrice est en ménopause",
  })
  @IsBoolean()
  isMenopausal: boolean;

  @ApiProperty({
    required: false,
    example: 28,
    description: 'Durée moyenne du cycle menstruel en jours',
  })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(45)
  averageCycleLength?: number;

  @ApiProperty({
    required: false,
    example: 5,
    description: 'Durée moyenne des règles en jours',
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  averagePeriodLength?: number;
}
