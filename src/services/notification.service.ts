import { prisma } from '../config/database.js';
import { UserNotification } from '../models/mongodb/userNotification.model.js';
import { emailService } from './email.service.js';

export class NotificationService {
  async list(userId: string, filters: {
    page: number;
    limit: number;
    isRead?: boolean;
    type?: string;
  }) {
    const where: any = { userId };
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userNotification.count({ where })
    ]);

    return {
      data: notifications,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async create(data: {
    userIds: string | string[];
    title: string;
    message: string;
    type: string;
    deliveryMethod?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    scheduledFor?: Date;
  }, createdBy?: string) {
    const userIds = Array.isArray(data.userIds) ? data.userIds : [data.userIds];
    
    const notifications = [];

    for (const userId of userIds) {
      const notification = await prisma.userNotification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          deliveryMethod: data.deliveryMethod || 'IN_APP',
          relatedEntityType: data.relatedEntityType,
          relatedEntityId: data.relatedEntityId,
          scheduledFor: data.scheduledFor
        }
      });

      notifications.push(notification);

      // Send immediately if not scheduled
      if (!data.scheduledFor || data.scheduledFor <= new Date()) {
        await this.sendNotification(notification);
      }
    }

    return notifications;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.userNotification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.userNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  async delete(id: string, userId: string) {
    const notification = await prisma.userNotification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return prisma.userNotification.delete({
      where: { id }
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.userNotification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  async sendScheduledNotifications() {
    const notifications = await prisma.userNotification.findMany({
      where: {
        scheduledFor: {
          lte: new Date()
        },
        deliveryStatus: 'PENDING'
      }
    });

    let sentCount = 0;

    for (const notification of notifications) {
      try {
        await this.sendNotification(notification);
        await prisma.userNotification.update({
          where: { id: notification.id },
          data: {
            deliveryStatus: 'SENT',
            sentAt: new Date()
          }
        });
        sentCount++;
      } catch (error) {
        console.error('Failed to send notification:', error);
        await prisma.userNotification.update({
          where: { id: notification.id },
          data: {
            deliveryStatus: 'FAILED'
          }
        });
      }
    }

    return sentCount;
  }

  private async sendNotification(notification: any) {
    // Send based on delivery method
    switch (notification.deliveryMethod) {
      case 'EMAIL':
        await this.sendEmailNotification(notification);
        break;
      case 'IN_APP':
      default:
        // In-app notifications are stored in the database
        break;
    }
  }

  private async sendEmailNotification(notification: any) {
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { email: true, username: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await emailService.sendEmail({
      to: user.email,
      subject: notification.title,
      template: 'notification',
      data: {
        username: user.username,
        title: notification.title,
        message: notification.message,
        type: notification.type
      }
    });
  }

  async createBulk(notifications: Array<{
    userIds: string | string[];
    title: string;
    message: string;
    type: string;
    deliveryMethod?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    scheduledFor?: Date;
  }>, createdBy?: string) {
    const results = [];

    for (const notifData of notifications) {
      const created = await this.create(notifData, createdBy);
      results.push(...created);
    }

    return results;
  }

  async getByType(userId: string, type: string, page: number, limit: number) {
    const where = {
      userId,
      type
    };

    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userNotification.count({ where })
    ]);

    return {
      data: notifications,
      total,
      page,
      limit
    };
  }

  async search(userId: string, query: string, page: number, limit: number) {
    const where = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { message: { contains: query, mode: 'insensitive' } }
      ]
    };

    const [notifications, total] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userNotification.count({ where })
    ]);

    return {
      data: notifications,
      total,
      page,
      limit
    };
  }

  async createExamReminder(examId: string, scheduledFor: Date) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        schedules: {
          include: {
            enrollments: {
              include: {
                user: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    // Collect all enrolled users
    const userIds = exam.schedules.flatMap(schedule => 
      schedule.enrollments.map(enrollment => enrollment.userId)
    );

    // Remove duplicates
    const uniqueUserIds = [...new Set(userIds)];

    return this.create({
      userIds: uniqueUserIds,
      title: 'Exam Reminder',
      message: `Your exam "${exam.title}" is scheduled to start soon.`,
      type: 'EXAM_REMINDER',
      relatedEntityType: 'EXAM',
      relatedEntityId: examId,
      scheduledFor
    });
  }

  async createResultNotification(examId: string, userId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { title: true }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    return this.create({
      userIds: [userId],
      title: 'Result Published',
      message: `Your results for "${exam.title}" have been published.`,
      type: 'RESULT_PUBLISHED',
      relatedEntityType: 'EXAM',
      relatedEntityId: examId
    });
  }

  async createAchievementNotification(userId: string, achievement: {
    title: string;
    description: string;
  }) {
    return this.create({
      userIds: [userId],
      title: 'Achievement Unlocked!',
      message: `Congratulations! You've unlocked the "${achievement.title}" achievement: ${achievement.description}`,
      type: 'ACHIEVEMENT_UNLOCKED',
      relatedEntityType: 'ACHIEVEMENT'
    });
  }
}

export const notificationService = new NotificationService();
