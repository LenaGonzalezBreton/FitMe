import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';

// Application Use Cases
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { MarkAllNotificationsAsReadUseCase } from './application/use-cases/mark-all-notifications-as-read.use-case';
import { UpdateNotificationPreferencesUseCase } from './application/use-cases/update-notification-preferences.use-case';

// Infrastructure Repositories
import { PrismaNotificationRepository } from './infrastructure/prisma-notification.repository';

// Controller
import { NotificationController } from './controller/notification.controller';

// Tokens for DI
import { NOTIFICATION_REPOSITORY_TOKEN } from './tokens';

@Module({
  imports: [CoreModule],
  controllers: [NotificationController],
  providers: [
    // Use Cases
    GetNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    UpdateNotificationPreferencesUseCase,

    // Repository Implementations
    {
      provide: NOTIFICATION_REPOSITORY_TOKEN,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    GetNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    MarkAllNotificationsAsReadUseCase,
    UpdateNotificationPreferencesUseCase,
    NOTIFICATION_REPOSITORY_TOKEN,
  ],
})
export class NotificationModule {}

