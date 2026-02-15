import { prisma } from '../config/database.js';
import Achievement from '../models/mongodb/achievement.model.js';
import { notificationService } from './notification.service.js';

export class AchievementService {
  async list(userId: string, filters: {
    page: number;
    limit: number;
    category?: string;
    rarity?: string;
  }) {
    const where: any = { userId };
    
    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.rarity) {
      where.rarity = filters.rarity;
    }

    const [achievements, total] = await Promise.all([
      Achievement.find(where)
        .sort({ unlockedAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      Achievement.countDocuments(where)
    ]);

    return {
      data: achievements,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async create(data: {
    userIds: string | string[];
    title: string;
    description: string;
    category: string;
    rarity?: string;
    badgeColor?: string;
    badgeIcon?: string;
    badgeUrl?: string;
  }, createdBy?: string) {
    const userIds = Array.isArray(data.userIds) ? data.userIds : [data.userIds];
    
    const achievements = [];

    for (const userId of userIds) {
      const achievement = new Achievement({
        userId,
        title: data.title,
        description: data.description,
        category: data.category,
        rarity: data.rarity || 'COMMON',
        badgeColor: data.badgeColor,
        badgeIcon: data.badgeIcon,
        badgeUrl: data.badgeUrl
      });

      await achievement.save();
      achievements.push(achievement);

      // Send notification
      await this.sendAchievementNotification(userId, achievement);
    }

    return achievements;
  }

  async getUnlocked(userId: string) {
    return await Achievement.find({ userId })
      .sort({ unlockedAt: -1 });
  }

  async getPending(userId: string) {
    // Get all possible achievements and check which ones are not yet unlocked
    const unlocked = await this.getUnlocked(userId);
    const unlockedTitles = new Set(unlocked.map(a => a.title));

    // Define all possible achievements
    const allAchievements = this.getAllPossibleAchievements();
    const pending = allAchievements.filter(a => !unlockedTitles.has(a.title));

    // Check progress for pending achievements
    const pendingWithProgress = await Promise.all(
      pending.map(async (achievement) => ({
        ...achievement,
        progress: await this.getAchievementProgress(userId, achievement.id)
      }))
    );

    return pendingWithProgress;
  }

  async getLeaderboard(category?: string, limit: number = 10) {
    const where: any = {};
    if (category) {
      where.category = category;
    }

    const pipeline = [
      { $match: where },
      {
        $group: {
          _id: '$userId',
          totalAchievements: { $sum: 1 },
          achievements: { $push: '$$ROOT' }
        }
      },
      { $sort: { totalAchievements: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ];

    return await Achievement.aggregate(pipeline);
  }

  async checkAchievements(userId: string, trigger: string, data: any) {
    const newAchievements: any[] = [];

    // Check different achievement types based on trigger
    switch (trigger) {
      case 'EXAM_PASSED':
        newAchievements.push(...await this.checkExamAchievements(userId, data));
        break;
      case 'EXAM_COMPLETED':
        newAchievements.push(...await this.checkCompletionAchievements(userId, data));
        break;
      case 'STREAK_ACHIEVED':
        newAchievements.push(...await this.checkStreakAchievements(userId, data));
        break;
      case 'TOP_SCORE':
        newAchievements.push(...await this.checkScoreAchievements(userId, data));
        break;
    }

    return newAchievements;
  }

  async getCategories() {
    const categories = await Achievement.distinct('category');
    return Promise.all(
      categories.map(async cat => ({
        name: cat,
        count: await Achievement.countDocuments({ category: cat })
      }))
    );
  }

  async getStats(userId: string) {
    const [total, byCategory, byRarity] = await Promise.all([
      Achievement.countDocuments({ userId }),
      Achievement.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Achievement.aggregate([
        { $match: { userId } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ])
    ]);

    return {
      total,
      byCategory,
      byRarity
    };
  }

  async getAchievementById(id: string, userId?: string) {
    const where: any = { _id: id };
    if (userId) {
      where.userId = userId;
    }

    return await Achievement.findOne(where);
  }

  async shareAchievement(id: string, userId: string, platform: string) {
    const achievement = await this.getAchievementById(id, userId);
    
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${baseUrl}/achievements/${id}?shared=true`;

    // In a real implementation, you would integrate with platform-specific APIs
    // For now, just return the share URL
    return { shareUrl, platform };
  }

  async getRecentAchievements(userId: string, limit: number = 5) {
    return await Achievement.find({ userId })
      .sort({ unlockedAt: -1 })
      .limit(limit);
  }

  async getProgress(userId: string) {
    const unlocked = await this.getUnlocked(userId);
    const pending = await this.getPending(userId);

    const total = unlocked.length + pending.length;
    const progress = total > 0 ? (unlocked.length / total) * 100 : 0;

    return {
      unlocked: unlocked.length,
      pending: pending.length,
      total,
      progress: Math.round(progress * 100) / 100,
      nextMilestone: this.getNextMilestone(unlocked.length)
    };
  }

  async createMilestone(data: {
    title: string;
    description: string;
    category: string;
    conditions: any[];
  }, createdBy?: string) {
    // In a real implementation, you might store milestones in a separate collection
    // For now, just return the data
    return {
      ...data,
      id: new Date().getTime().toString(),
      createdAt: new Date()
    };
  }

  async getMilestones(userId: string) {
    const unlocked = await this.getUnlocked(userId);
    const count = unlocked.length;

    return [
      {
        id: 'first',
        title: 'First Achievement',
        description: 'Unlock your first achievement',
        achieved: count >= 1,
        progress: Math.min(count, 1)
      },
      {
        id: 'ten',
        title: 'Achievement Hunter',
        description: 'Unlock 10 achievements',
        achieved: count >= 10,
        progress: Math.min(count, 10)
      },
      {
        id: 'twenty-five',
        title: 'Master Achiever',
        description: 'Unlock 25 achievements',
        achieved: count >= 25,
        progress: Math.min(count, 25)
      },
      {
        id: 'fifty',
        title: 'Legendary',
        description: 'Unlock 50 achievements',
        achieved: count >= 50,
        progress: Math.min(count, 50)
      }
    ];
  }

  async sendAchievementNotification(userId: string, achievement: any) {
    await notificationService.createAchievementNotification(userId, {
      title: achievement.title,
      description: achievement.description
    });
  }

  private async checkExamAchievements(userId: string, data: { examId: string; score: number }) {
    const achievements: any[] = [];
    const userAttempts = await prisma.examAttempt.count({
      where: { userId, status: 'SUBMITTED' }
    });

    // First exam passed
    if (userAttempts === 1 && data.score >= 33) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'First Success',
        description: 'Pass your first exam',
        category: 'EXAM',
        rarity: 'COMMON',
        badgeIcon: '🎯'
      }));
    }

    // Perfect score
    if (data.score === 100) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Perfectionist',
        description: 'Score 100% in an exam',
        category: 'EXAM',
        rarity: 'EPIC',
        badgeIcon: '💯'
      }));
    }

    // High scorer
    if (data.score >= 90) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Top Performer',
        description: 'Score above 90% in an exam',
        category: 'EXAM',
        rarity: 'RARE',
        badgeIcon: '⭐'
      }));
    }

    return achievements;
  }

  private async checkCompletionAchievements(userId: string, data: { examId: string }) {
    const achievements: any[] = [];
    const totalAttempts = await prisma.examAttempt.count({
      where: { userId, status: 'SUBMITTED' }
    });

    // Exam marathon
    if (totalAttempts === 10) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Exam Marathon',
        description: 'Complete 10 exams',
        category: 'EXAM',
        rarity: 'RARE',
        badgeIcon: '🏃'
      }));
    }

    // Dedicated student
    if (totalAttempts === 25) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Dedicated Student',
        description: 'Complete 25 exams',
        category: 'EXAM',
        rarity: 'EPIC',
        badgeIcon: '📚'
      }));
    }

    return achievements;
  }

  private async checkStreakAchievements(userId: string, data: { streakDays: number }) {
    const achievements: any[] = [];

    if (data.streakDays === 7) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        category: 'STREAK',
        rarity: 'COMMON',
        badgeIcon: '🔥'
      }));
    }

    if (data.streakDays === 30) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Monthly Master',
        description: 'Maintain a 30-day study streak',
        category: 'STREAK',
        rarity: 'EPIC',
        badgeIcon: '🌟'
      }));
    }

    return achievements;
  }

  private async checkScoreAchievements(userId: string, data: { rank: number; totalParticipants: number }) {
    const achievements: any[] = [];
    const percentile = (data.totalParticipants - data.rank) / data.totalParticipants * 100;

    // Top 10%
    if (percentile >= 90) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Elite Performer',
        description: 'Rank in the top 10% of participants',
        category: 'RANKING',
        rarity: 'RARE',
        badgeIcon: '🏆'
      }));
    }

    // First place
    if (data.rank === 1) {
      achievements.push(await this.create({
        userIds: [userId],
        title: 'Champion',
        description: 'Achieve first place in an exam',
        category: 'RANKING',
        rarity: 'LEGENDARY',
        badgeIcon: '👑'
      }));
    }

    return achievements;
  }

  private getAllPossibleAchievements() {
    return [
      {
        id: 'first-exam',
        title: 'First Steps',
        description: 'Take your first exam',
        category: 'EXAM',
        rarity: 'COMMON'
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Complete an exam in half the allocated time',
        category: 'EXAM',
        rarity: 'RARE'
      },
      {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Complete an exam after 10 PM',
        category: 'EXAM',
        rarity: 'COMMON'
      },
      {
        id: 'early-bird',
        title: 'Early Bird',
        description: 'Complete an exam before 6 AM',
        category: 'EXAM',
        rarity: 'COMMON'
      },
      {
        id: 'explorer',
        title: 'Explorer',
        description: 'Attempt exams from 5 different subjects',
        category: 'EXAM',
        rarity: 'UNCOMMON'
      }
    ];
  }

  private async getAchievementProgress(userId: string, achievementId: string): Promise<number> {
    // Calculate progress percentage for a specific achievement
    // This is a simplified version - you'd implement specific logic for each achievement
    const unlocked = await this.getUnlocked(userId);
    
    switch (achievementId) {
      case 'first-exam':
        const attempts = await prisma.examAttempt.count({
          where: { userId }
        });
        return Math.min(attempts * 100, 100);
      
      case 'explorer':
        const subjects = await prisma.examAttempt.findMany({
          where: { userId },
          include: {
            exam: {
              include: {
                class: {
                  include: {
                    board: true
                  }
                }
              }
            }
          }
        });
        const uniqueSubjects = new Set(subjects.map(s => s.exam.class?.board?.name)).size;
        return Math.min((uniqueSubjects / 5) * 100, 100);
      
      default:
        return 0;
    }
  }

  private getNextMilestone(currentCount: number): string {
    if (currentCount < 1) return 'First Achievement';
    if (currentCount < 10) return 'Achievement Hunter (10)';
    if (currentCount < 25) return 'Master Achiever (25)';
    if (currentCount < 50) return 'Legendary (50)';
    return 'Mythic (100)';
  }
}

export const achievementService = new AchievementService();
