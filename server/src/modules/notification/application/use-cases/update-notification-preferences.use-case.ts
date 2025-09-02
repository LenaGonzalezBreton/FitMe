import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/notification.repository';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../tokens';

export interface UpdateNotificationPreferencesRequest {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  workoutReminders: boolean;
  cycleReminders: boolean;
  achievementNotifications: boolean;
}

export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class UpdateNotificationPreferencesUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(request: UpdateNotificationPreferencesRequest): Promise<UpdateNotificationPreferencesResponse> {
    try {
      await this.notificationRepository.updatePreferences(
        request.userId,
        {
          emailNotifications: request.emailNotifications,
          pushNotifications: request.pushNotifications,
          workoutReminders: request.workoutReminders,
          cycleReminders: request.cycleReminders,
          achievementNotifications: request.achievementNotifications,
        }
      );
      
      return {
        success: true,
        message: 'Notification preferences updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to update notification preferences',
      };
    }
  }
}
