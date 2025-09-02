import { Injectable, Inject } from '@nestjs/common';
import { IUserPreferencesRepository } from '../../domain/user-preferences.repository';
import { USER_PREFERENCES_REPOSITORY_TOKEN } from '../../tokens';
import { UserSettingsData } from 'src/modules/auth/domain/auth.repository';

export interface UpdateUserPreferencesRequest {
  userId: string;
  theme?: UserSettingsData['theme'];
  language?: UserSettingsData['language'];
  units?: UserSettingsData['units'];
  notifications?: UserSettingsData['notifications'];
  privacy?: UserSettingsData['privacy'];
}

export interface UpdateUserPreferencesResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class UpdateUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY_TOKEN)
    private readonly userPreferencesRepository: IUserPreferencesRepository
  ) {}

  async execute(request: UpdateUserPreferencesRequest): Promise<UpdateUserPreferencesResponse> {
    try {
      await this.userPreferencesRepository.updateUserPreferences(request.userId, request);
      
      return {
        success: true,
        message: 'User preferences updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update user preferences',
      };
    }
  }
}
