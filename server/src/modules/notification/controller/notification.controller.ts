import { Controller, Get, Post, Put, Query, Body, Request } from '@nestjs/common';
import { GetNotificationsUseCase } from '../application/use-cases/get-notifications.use-case';
import { MarkNotificationAsReadUseCase } from '../application/use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../application/use-cases/mark-all-notifications-as-read.use-case';
import { UpdateNotificationPreferencesUseCase } from '../application/use-cases/update-notification-preferences.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly updateNotificationPreferencesUseCase: UpdateNotificationPreferencesUseCase,
  ) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('read') read?: string,
  ) {
    return this.getNotificationsUseCase.execute({
      userId: req.user.id,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      read: read === 'true' ? true : read === 'false' ? false : undefined,
    });
  }

  @Post('mark-read')
  async markAsRead(
    @Request() req: any,
    @Body('notificationId') notificationId: string,
  ) {
    return this.markNotificationAsReadUseCase.execute({
      userId: req.user.id,
      notificationId,
    });
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    return this.markAllNotificationsAsReadUseCase.execute({
      userId: req.user.id,
    });
  }

  @Put('preferences')
  async updatePreferences(
    @Request() req: any,
    @Body() preferences: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      workoutReminders: boolean;
      cycleReminders: boolean;
      achievementNotifications: boolean;
    },
  ) {
    return this.updateNotificationPreferencesUseCase.execute({
      userId: req.user.id,
      ...preferences,
    });
  }
}
