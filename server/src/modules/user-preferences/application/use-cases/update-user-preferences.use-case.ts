import { Injectable, Inject } from '@nestjs/common';
import { IUserPreferencesRepository } from '../../domain/user-preferences.repository';
import { USER_PREFERENCES_REPOSITORY_TOKEN } from '../../tokens';

export interface UpdateUserPreferencesRequest {
  userId: string;
  theme?: 'LIGHT' | 'DARK' | 'AUTO';
  language?: 'FRENCH' | 'ENGLISH';
  notifications?: {
    email: boolean;
    push: boolean;
    workout: boolean;
    cycle: boolean;
    achievements: boolean;
  };
  privacy?: {
    shareProgress: boolean;
    shareCycle: boolean;
    allowAnalytics: boolean;
  };
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
