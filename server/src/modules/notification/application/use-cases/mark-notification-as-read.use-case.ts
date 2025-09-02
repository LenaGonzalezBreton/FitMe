import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/notification.repository';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../tokens';

export interface MarkNotificationAsReadRequest {
  userId: string;
  notificationId: string;
}

export interface MarkNotificationAsReadResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class MarkNotificationAsReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(request: MarkNotificationAsReadRequest): Promise<MarkNotificationAsReadResponse> {
    try {
      await this.notificationRepository.markAsRead(request.userId, request.notificationId);
      
      return {
        success: true,
        message: 'Notification marked as read',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to mark notification as read',
      };
    }
  }
}
