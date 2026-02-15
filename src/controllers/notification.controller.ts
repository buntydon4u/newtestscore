import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export class NotificationController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 20, isRead, type } = req.query;
    
    const data = await notificationService.list(
      req.user!.userId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        type: type as string
      }
    );

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const { userIds, title, message, type, deliveryMethod, relatedEntityType, relatedEntityId, scheduledFor } = req.body;
    
    const data = await notificationService.create({
      userIds,
      title,
      message,
      type,
      deliveryMethod,
      relatedEntityType,
      relatedEntityId,
      scheduledFor
    }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'NOTIFICATION_CREATE',
      entity: 'USER_NOTIFICATION',
      newValues: { count: Array.isArray(userIds) ? userIds.length : 1 },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async markAsRead(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    await notificationService.markAsRead(id, req.user!.userId);

    res.json({ message: 'Notification marked as read' });
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    await notificationService.markAllAsRead(req.user!.userId);

    res.json({ message: 'All notifications marked as read' });
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    await notificationService.delete(id, req.user!.userId);

    res.json({ message: 'Notification deleted successfully' });
  }

  async getUnreadCount(req: Request, res: Response) {
    const count = await notificationService.getUnreadCount(req.user!.userId);

    res.json({ count });
  }

  async sendScheduledNotifications(req: AuthRequest, res: Response) {
    const count = await notificationService.sendScheduledNotifications();

    res.json({ message: `Sent ${count} scheduled notifications` });
  }

  async createBulk(req: AuthRequest, res: Response) {
    const { notifications } = req.body;
    
    const data = await notificationService.createBulk(notifications, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'NOTIFICATION_BULK_CREATE',
      entity: 'USER_NOTIFICATION',
      newValues: { count: notifications.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: `Created ${data.length} notifications successfully`,
      data
    });
  }

  async getByType(req: Request, res: Response) {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const data = await notificationService.getByType(
      req.user!.userId,
      type,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(data);
  }

  async search(req: Request, res: Response) {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      throw new AppError(400, 'Search query is required');
    }

    const data = await notificationService.search(
      req.user!.userId,
      q as string,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(data);
  }
}
