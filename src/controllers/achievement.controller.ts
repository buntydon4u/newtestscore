import { Request, Response } from 'express';
import { achievementService } from '../services/achievement.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export class AchievementController {
  async list(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 20, category, rarity } = req.query;
    
    const data = await achievementService.list(
      userId || req.user!.userId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        rarity: rarity as string
      }
    );

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const { userIds, title, description, category, rarity, badgeColor, badgeIcon, badgeUrl } = req.body;
    
    const data = await achievementService.create({
      userIds,
      title,
      description,
      category,
      rarity,
      badgeColor,
      badgeIcon,
      badgeUrl
    }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ACHIEVEMENT_CREATE',
      entity: 'ACHIEVEMENT',
      newValues: { count: Array.isArray(userIds) ? userIds.length : 1 },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async getUnlocked(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await achievementService.getUnlocked(userId || req.user!.userId);

    res.json(data);
  }

  async getPending(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await achievementService.getPending(userId || req.user!.userId);

    res.json(data);
  }

  async getLeaderboard(req: Request, res: Response) {
    const { category, limit = 10 } = req.query;
    
    const data = await achievementService.getLeaderboard(
      category as string,
      parseInt(limit as string)
    );

    res.json(data);
  }

  async checkAchievements(req: AuthRequest, res: Response) {
    const { userId } = req.params;
    const { trigger, data } = req.body;
    
    const newAchievements = await achievementService.checkAchievements(
      userId || req.user!.userId,
      trigger,
      data
    );

    if (newAchievements.length > 0) {
      // Send notifications for new achievements
      for (const achievement of newAchievements) {
        await achievementService.sendAchievementNotification(
          userId || req.user!.userId,
          achievement
        );
      }
    }

    res.json({
      newAchievements,
      count: newAchievements.length
    });
  }

  async getCategories(req: Request, res: Response) {
    const data = await achievementService.getCategories();

    res.json(data);
  }

  async getStats(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await achievementService.getStats(userId || req.user!.userId);

    res.json(data);
  }

  async getAchievementById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await achievementService.getAchievementById(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Achievement not found');
    }

    res.json(data);
  }

  async shareAchievement(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { platform } = req.body;
    
    const shareUrl = await achievementService.shareAchievement(
      id,
      req.user!.userId,
      platform
    );

    res.json({ shareUrl });
  }

  async getRecentAchievements(req: Request, res: Response) {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    
    const data = await achievementService.getRecentAchievements(
      userId || req.user!.userId,
      parseInt(limit as string)
    );

    res.json(data);
  }

  async getProgress(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await achievementService.getProgress(userId || req.user!.userId);

    res.json(data);
  }

  async createMilestone(req: AuthRequest, res: Response) {
    const { title, description, category, conditions } = req.body;
    
    const data = await achievementService.createMilestone({
      title,
      description,
      category,
      conditions
    }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'MILESTONE_CREATE',
      entity: 'ACHIEVEMENT',
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async getMilestones(req: Request, res: Response) {
    const { userId } = req.params;
    const data = await achievementService.getMilestones(userId || req.user!.userId);

    res.json(data);
  }
}
