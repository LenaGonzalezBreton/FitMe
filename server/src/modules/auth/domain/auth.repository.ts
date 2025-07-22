import { AuthUser } from './auth.entity';

// Types enum pour éviter les problèmes d'import
export enum ProfileType {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
}

export enum ContextType {
  CYCLE = 'CYCLE',
  GENERAL = 'GENERAL',
  MENOPAUSE = 'MENOPAUSE',
  NONE = 'NONE',
}

export interface IUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(userId: string): Promise<AuthUser | null>;
  create(userData: CreateUserData): Promise<AuthUser>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
  updateProfile(
    userId: string,
    profileData: UpdateProfileData,
  ): Promise<AuthUser>;
}

export interface IRefreshTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenData | null>;
  revokeByUserId(userId: string): Promise<void>;
  revokeByTokenHash(tokenHash: string): Promise<void>;
}

export interface IAuthSessionRepository {
  create(sessionData: CreateSessionData): Promise<string>;
  findByUserId(userId: string): Promise<SessionData[]>;
  updateLastSeen(sessionId: string): Promise<void>;
  deactivateSession(sessionId: string): Promise<void>;
  deactivateAllUserSessions(userId: string): Promise<void>;
}

// Types de données
export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  profileType?: ProfileType;
  contextType?: ContextType;
}

export interface UpdateProfileData {
  firstName?: string;
  birthDate?: Date;
  profileType?: ProfileType;
  contextType?: ContextType;
  objective?: string;
  sportFrequency?: string;
  isMenopausal?: boolean;
}

// Settings interfaces
export interface UserSettingsData {
  id: string;
  userId: string;
  unitPreference: string;
  notificationEnabled: boolean;
  notificationTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettingsData {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  time?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserObjectiveData {
  id: string;
  userId: string;
  type: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFeatureFlagData {
  id: string;
  userId: string;
  feature: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettingsRepository {
  getUserSettings(userId: string): Promise<UserSettingsData | null>;
  createOrUpdateUserSettings(
    userId: string,
    data: Partial<UserSettingsData>,
  ): Promise<UserSettingsData>;
  getReminderSettings(userId: string): Promise<ReminderSettingsData[]>;
  createOrUpdateReminderSetting(
    userId: string,
    type: string,
    data: Partial<ReminderSettingsData>,
  ): Promise<ReminderSettingsData>;
  getUserObjectives(userId: string): Promise<UserObjectiveData[]>;
  createOrUpdateUserObjective(
    userId: string,
    type: string,
    note?: string,
  ): Promise<UserObjectiveData>;
  getUserFeatureFlags(userId: string): Promise<UserFeatureFlagData[]>;
  createOrUpdateFeatureFlag(
    userId: string,
    feature: string,
    isEnabled: boolean,
  ): Promise<UserFeatureFlagData>;
}

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
}

export interface CreateSessionData {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface SessionData {
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  lastSeen: Date;
  isActive: boolean;
}
