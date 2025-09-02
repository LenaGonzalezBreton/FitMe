import { Injectable, Inject } from '@nestjs/common';
import { INotificationRepository } from '../../domain/notification.repository';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../tokens';

export interface GetNotificationsRequest {
  userId: string;
  limit?: number;
  offset?: number;
  read?: boolean;
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: NotificationData[];
  total: number;
  message: string;
}

@Injectable()
export class GetNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(request: GetNotificationsRequest): Promise<GetNotificationsResponse> {
    try {
      const { notifications, total } = await this.notificationRepository.getNotifications(
        request.userId,
        request.limit || 50,
        request.offset || 0,
        request.read
      );
      
      return {
        success: true,
        data: notifications,
        total,
        message: 'Notifications retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error.message || 'Failed to retrieve notifications',
      };
    }
  }
}
