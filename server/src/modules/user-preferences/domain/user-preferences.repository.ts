import { UserPreferencesData } from '../application/use-cases';

export interface IUserPreferencesRepository {
  getUserPreferences(userId: string): Promise<UserPreferencesData>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferencesData>): Promise<void>;
}
