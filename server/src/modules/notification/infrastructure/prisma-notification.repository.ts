import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma.service';
import { INotificationRepository, NotificationPreferences } from '../domain/notification.repository';
import { NotificationData } from '../application/use-cases';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(
    userId: string,
    limit: number,
    offset: number,
    read?: boolean,
  ): Promise<{ notifications: NotificationData[]; total: number }> {
    const where = {
      userId,
      ...(read !== undefined && { read }),
    };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const notificationData: NotificationData[] = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.message, // Use message as title since title doesn't exist
      message: n.message,
      type: n.type as 'info' | 'warning' | 'success' | 'error',
      read: n.isRead, // Use isRead instead of read
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    return { notifications: notificationData, total };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });
  }

  async updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    await this.prisma.notificationPreference.upsert({
      where: { 
        userId_type: {
          userId,
          type: 'GENERAL_TIP'
        }
      },
      update: {
        email: preferences.emailNotifications,
        push: preferences.pushNotifications,
        frequency: 'DAILY',
        time: new Date(),
      },
      create: {
        userId,
        type: 'GENERAL_TIP',
        email: preferences.emailNotifications,
        push: preferences.pushNotifications,
        frequency: 'DAILY',
        time: new Date(),
      },
    });
  }
}
