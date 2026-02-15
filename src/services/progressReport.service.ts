import { prisma } from '../config/database.js';
import ProgressReport from '../models/mongodb/progressReport.model.js';

export class ProgressReportService {
  async getReports(userId: string, filters: {
    page: number;
    limit: number;
    reportPeriod?: string;
  }) {
    const where: any = { userId };
    
    if (filters.reportPeriod) {
      where.reportPeriod = filters.reportPeriod;
    }

    const [reports, total] = await Promise.all([
      ProgressReport.find(where)
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit),
      ProgressReport.countDocuments(where)
    ]);

    return {
      data: reports,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async generateReport(userId: string, data: {
    reportPeriod: string;
    periodStart: Date;
    periodEnd: Date;
  }, generatedBy?: string) {
    // Get user's exam attempts in the period
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: data.periodStart,
          lte: data.periodEnd
        },
        status: 'SUBMITTED'
      },
      include: {
        exam: {
          include: {
            class: {
              include: {
                board: true
              }
            }
          }
        },
        scores: true
      }
    });

    // Calculate metrics
    const totalExams = attempts.length;
    const totalStudyTime = await this.calculateStudyTime(userId, data.periodStart, data.periodEnd);
    const topicsAttempted = await this.getTopicsAttempted(userId, data.periodStart, data.periodEnd);
    
    let averageScore = 0;
    let strengths: string[] = [];
    let improvements: string[] = [];
    let recommendations: string[] = [];

    if (totalExams > 0) {
      const totalScore = attempts.reduce((sum, attempt) => {
        return sum + (attempt.scores[0]?.percentage || 0);
      }, 0);
      averageScore = totalScore / totalExams;

      // Analyze performance by topic
      const topicPerformance = await this.analyzeTopicPerformance(userId, data.periodStart, data.periodEnd);
      strengths = topicPerformance.filter(t => t.percentage >= 70).map(t => t.topicName);
      improvements = topicPerformance.filter(t => t.percentage < 50).map(t => t.topicName);

      // Generate recommendations
      recommendations = this.generateRecommendations(topicPerformance, averageScore);
    }

    const report = new ProgressReport({
      userId,
      reportPeriod: data.reportPeriod,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      overallProgress: Math.round(averageScore),
      averageScore: Math.round(averageScore * 100) / 100,
      studyHours: Math.round(totalStudyTime / 60), // Convert minutes to hours
      examCount: totalExams,
      topicsAttempted,
      strengths,
      improvements,
      recommendations
    });

    return await report.save();
  }

  async getReport(id: string, userId?: string) {
    const where: any = { _id: id };
    if (userId) {
      where.userId = userId;
    }

    return await ProgressReport.findOne(where);
  }

  async getWeeklyProgress(userId: string) {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return this.generateReport(userId, {
      reportPeriod: 'weekly',
      periodStart: weekStart,
      periodEnd: weekEnd
    });
  }

  async getMonthlyProgress(userId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.generateReport(userId, {
      reportPeriod: 'monthly',
      periodStart: monthStart,
      periodEnd: monthEnd
    });
  }

  async getSubjectWiseProgress(userId: string, subject?: string) {
    const where: any = { userId };
    
    if (subject) {
      where['exam.class.board.name'] = subject;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'examattempts',
          localField: 'userId',
          foreignField: 'userId',
          as: 'attempts'
        }
      },
      {
        $unwind: '$attempts'
      },
      {
        $lookup: {
          from: 'exams',
          localField: 'attempts.examId',
          foreignField: 'id',
          as: 'exam'
        }
      },
      {
        $unwind: '$exam'
      },
      {
        $lookup: {
          from: 'classes',
          localField: 'exam.classId',
          foreignField: 'id',
          as: 'class'
        }
      },
      {
        $unwind: '$class'
      },
      {
        $lookup: {
          from: 'examboards',
          localField: 'class.boardId',
          foreignField: 'id',
          as: 'board'
        }
      },
      {
        $unwind: '$board'
      },
      {
        $match: where
      },
      {
        $group: {
          _id: '$board.name',
          totalExams: { $sum: 1 },
          averageScore: { $avg: '$attempts.scores.percentage' },
          bestScore: { $max: '$attempts.scores.percentage' },
          worstScore: { $min: '$attempts.scores.percentage' }
        }
      }
    ];

    return await prisma.$queryRawUnsafe(`SELECT * FROM (${pipeline.join(' ')}) as result`);
  }

  async getOverallProgress(userId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: { userId, status: 'SUBMITTED' },
      include: {
        scores: true,
        exam: {
          select: {
            totalMarks: true
          }
        }
      }
    });

    if (attempts.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalStudyTime: 0,
        streakDays: 0,
        rank: null
      };
    }

    const scores = attempts.map(a => a.scores[0]?.percentage || 0);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const totalStudyTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

    // Get rank among all users
    const rank = await this.getUserRank(userId);

    return {
      totalExams: attempts.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      worstScore,
      totalStudyTime,
      streakDays: await this.getStreakDays(userId),
      rank
    };
  }

  async getProgressChart(userId: string, period: string = 'monthly', months: number = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate
        },
        status: 'SUBMITTED'
      },
      include: {
        scores: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by period
    const grouped: Record<string, number[]> = {};
    
    attempts.forEach(attempt => {
      const date = new Date(attempt.createdAt);
      let key: string;
      
      if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${Math.ceil(date.getDate() / 7)}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(attempt.scores[0]?.percentage || 0);
    });

    // Calculate averages for each period
    const chartData = Object.entries(grouped).map(([period, scores]) => ({
      period,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      examCount: scores.length
    }));

    return chartData;
  }

  async compareProgress(userId1: string, userId2: string, period: string = 'monthly') {
    const [user1Data, user2Data] = await Promise.all([
      this.getOverallProgress(userId1),
      this.getOverallProgress(userId2)
    ]);

    return {
      user1: user1Data,
      user2: user2Data,
      comparison: {
        scoreDifference: user1Data.averageScore - user2Data.averageScore,
        examDifference: user1Data.totalExams - user2Data.totalExams,
        leader: user1Data.averageScore > user2Data.averageScore ? userId1 : userId2
      }
    };
  }

  async getStrengthsAndImprovements(userId: string) {
    const latestReport = await ProgressReport.findOne({
      userId,
      sort: { createdAt: -1 }
    });

    if (!latestReport) {
      return {
        strengths: [],
        improvements: [],
        recommendations: []
      };
    }

    return {
      strengths: latestReport.strengths,
      improvements: latestReport.improvements,
      recommendations: latestReport.recommendations
    };
  }

  async updateReport(id: string, data: {
    strengths?: string[];
    improvements?: string[];
    recommendations?: string[];
  }, userId: string) {
    return await ProgressReport.findOneAndUpdate(
      { _id: id, userId },
      { 
        $set: data,
        updatedAt: new Date()
      },
      { new: true }
    );
  }

  async deleteReport(id: string, userId: string) {
    return await ProgressReport.findOneAndDelete({
      _id: id,
      userId
    });
  }

  async generateBulkReports(userIds: string[], data: {
    reportPeriod: string;
    periodStart: Date;
    periodEnd: Date;
  }, generatedBy?: string) {
    const reports = [];

    for (const userId of userIds) {
      try {
        const report = await this.generateReport(userId, data, generatedBy);
        reports.push(report);
      } catch (error) {
        console.error(`Failed to generate report for user ${userId}:`, error);
      }
    }

    return reports;
  }

  private async calculateStudyTime(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: { timeSpent: true }
    });

    return attempts.reduce((total, attempt) => total + attempt.timeSpent, 0);
  }

  private async getTopicsAttempted(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const topicScores = await prisma.topicScore.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return topicScores.length;
  }

  private async analyzeTopicPerformance(userId: string, startDate: Date, endDate: Date) {
    const topicScores = await prisma.topicScore.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        topic: {
          select: {
            name: true
          }
        }
      }
    });

    return topicScores.map(ts => ({
      topicId: ts.topicId,
      topicName: ts.topic.name,
      percentage: ts.percentage,
      totalQuestions: ts.totalQuestions,
      correctQuestions: ts.correctQuestions
    }));
  }

  private generateRecommendations(topicPerformance: any[], averageScore: number): string[] {
    const recommendations: string[] = [];

    if (averageScore < 50) {
      recommendations.push('Focus on understanding basic concepts before attempting advanced problems');
      recommendations.push('Consider taking additional practice tests to improve your score');
    } else if (averageScore < 70) {
      recommendations.push('Review topics where you scored below average');
      recommendations.push('Practice more questions to improve speed and accuracy');
    } else {
      recommendations.push('Challenge yourself with more difficult problems');
      recommendations.push('Help peers by explaining concepts to them');
    }

    const weakTopics = topicPerformance.filter(t => t.percentage < 50);
    if (weakTopics.length > 0) {
      recommendations.push(`Pay special attention to: ${weakTopics.map(t => t.topicName).join(', ')}`);
    }

    return recommendations;
  }

  private async getUserRank(userId: string): Promise<number | null> {
    const userScore = await prisma.userScore.aggregate({
      where: { userId },
      _avg: { percentage: true }
    });

    if (!userScore._avg.percentage) {
      return null;
    }

    const betterUsers = await prisma.userScore.groupBy({
      by: ['userId'],
      _avg: { percentage: true },
      having: {
        percentage: {
          gt: userScore._avg.percentage
        }
      }
    });

    return betterUsers.length + 1;
  }

  private async getStreakDays(userId: string): Promise<number> {
    // Get last 30 days of activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attempts = await prisma.examAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (attempts.length === 0) {
      return 0;
    }

    // Calculate consecutive days
    let streak = 1;
    let currentDate = new Date(attempts[0].createdAt);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < attempts.length; i++) {
      const attemptDate = new Date(attempts[i].createdAt);
      attemptDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = attemptDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }
}

export const progressReportService = new ProgressReportService();
