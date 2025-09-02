import { NotificationData } from '../application/use-cases';

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  workoutReminders: boolean;
  cycleReminders: boolean;
  achievementNotifications: boolean;
}

export interface INotificationRepository {
  getNotifications(userId: string, limit: number, offset: number, read?: boolean): Promise<{ notifications: NotificationData[]; total: number }>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>;
}
