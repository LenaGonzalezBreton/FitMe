import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/notification.repository';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../tokens';

export interface MarkAllNotificationsAsReadRequest {
  userId: string;
}

export interface MarkAllNotificationsAsReadResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class MarkAllNotificationsAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(request: MarkAllNotificationsAsReadRequest): Promise<MarkAllNotificationsAsReadResponse> {
    try {
      await this.notificationRepository.markAllAsRead(request.userId);
      
      return {
        success: true,
        message: 'All notifications marked as read',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to mark all notifications as read',
      };
    }
  }
}
