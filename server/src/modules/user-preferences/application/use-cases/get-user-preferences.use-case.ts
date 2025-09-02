import { Injectable, Inject } from '@nestjs/common';
import { IUserPreferencesRepository } from '../../domain/user-preferences.repository';
import { USER_PREFERENCES_REPOSITORY_TOKEN } from '../../tokens';
import { UserSettingsData } from 'src/modules/auth/domain/auth.repository';

export interface GetUserPreferencesRequest {
  userId: string;
}

export interface UserPreferencesData {
  userId: string;
  theme: UserSettingsData['theme'];
  language: UserSettingsData['language'];
  notifications: UserSettingsData['notifications'];
  privacy: UserSettingsData['privacy'];
}

export interface GetUserPreferencesResponse {
  success: boolean;
  data: UserPreferencesData;
  message: string;
}

@Injectable()
export class GetUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY_TOKEN)
    private readonly userPreferencesRepository: IUserPreferencesRepository
  ) {}

  async execute(request: GetUserPreferencesRequest): Promise<GetUserPreferencesResponse> {
    try {
      const preferences = await this.userPreferencesRepository.getUserPreferences(request.userId);
      
      return {
        success: true,
        data: preferences,
        message: 'User preferences retrieved successfully',
      };
    } catch (error) {
      // Return default preferences if none exist
      return {
        success: true,
        data: {
          userId: request.userId,
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
        },
        message: 'Default preferences returned',
      };
    }
  }
}
