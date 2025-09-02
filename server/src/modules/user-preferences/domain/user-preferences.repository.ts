import { UserSettingsData } from 'src/modules/auth/domain/auth.repository';

export interface IUserPreferencesRepository {
  getUserPreferences(userId: string): Promise<UserSettingsData>;
  updateUserPreferences(userId: string, preferences: Partial<UserSettingsData>): Promise<void>;
}
