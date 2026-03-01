import { Request, Response } from 'express';
import { scoringService } from '../services/scoring.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class ScoringController {
  async evaluateAttempt(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { manualGrading } = req.body;
    
    const data = await scoringService.evaluateAttempt(id, manualGrading, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ATTEMPT_EVALUATE',
      entity: 'USER_SCORE',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getScore(req: Request, res: Response) {
    const { id } = req.params;
    const data = await scoringService.getScore(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Score not found');
    }

    res.json(data);
  }

  async getResults(req: Request, res: Response) {
    const { id } = req.params;
    const data = await scoringService.getResults(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Results not found');
    }

    res.json(data);
  }

  async getSectionScores(req: Request, res: Response) {
    const { id } = req.params;
    const data = await scoringService.getSectionScores(id, req.user?.userId);

    res.json(data);
  }

  async getUserAttemptHistory(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10, examId } = req.query;

    const effectiveUserId = userId || req.user?.userId;
    if (!effectiveUserId) {
      throw new AppError(400, 'User id is required');
    }

    const data = await scoringService.getUserAttemptHistory(
      effectiveUserId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        examId: examId as string
      }
    );

    res.json(data);
  }

  async getUserScoreSummary(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 100, examId } = req.query;

    const effectiveUserId = userId || req.user?.userId;
    if (!effectiveUserId) {
      throw new AppError(400, 'User id is required');
    }

    const result = await scoringService.getUserAttemptHistory(
      effectiveUserId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        examId: examId as string
      }
    );

    const summary = result.data.map((score: any) => ({
      examId: score.attempt?.exam?.id || score.attempt?.examId || score.attemptId,
      totalScore: score.marksSecured,
      maxScore: score.totalMarks,
      percentage: score.percentage,
      createdAt: score.createdAt
    }));

    res.json(summary);
  }

  async getMyScoreSummary(req: AuthRequest, res: Response) {
    const { page = 1, limit = 100, examId } = req.query;

    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await scoringService.getUserAttemptHistory(
      userId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        examId: examId as string
      }
    );

    const summary = result.data.map((score: any) => ({
      examId: score.attempt?.exam?.id || score.attempt?.examId || score.attemptId,
      totalScore: score.marksSecured,
      maxScore: score.totalMarks,
      percentage: score.percentage,
      createdAt: score.createdAt
    }));

    res.json(summary);
  }

  async getExamResults(req: Request, res: Response) {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const data = await scoringService.getExamResults(
      examId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(data);
  }

  async getLeaderboard(req: Request, res: Response) {
    const { examId } = req.params;
    const { limit = 10 } = req.query;
    
    const data = await scoringService.getLeaderboard(examId, parseInt(limit as string));

    res.json(data);
  }

  async getStatistics(req: Request, res: Response) {
    const { examId } = req.params;
    const data = await scoringService.getExamStatistics(examId);

    res.json(data);
  }

  async updateManualScore(req: AuthRequest, res: Response) {
    const { attemptId, questionId } = req.params;
    const { marksAwarded, isCorrect, feedback } = req.body;
    
    const data = await scoringService.updateManualScore(
      attemptId,
      questionId,
      marksAwarded,
      isCorrect,
      feedback,
      req.user!.userId
    );

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'MANUAL_SCORE_UPDATE',
      entity: 'QUESTION_ANSWER',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async bulkGrade(req: AuthRequest, res: Response) {
    const { attemptId } = req.params;
    const { grading } = req.body;
    
    const data = await scoringService.bulkGrade(attemptId, grading, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BULK_GRADING',
      entity: 'EXAM_ATTEMPT',
      entityId: attemptId,
      newValues: { gradedCount: grading.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async recomputeScore(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    const data = await scoringService.recomputeScore(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'SCORE_RECOMPUTE',
      entity: 'USER_SCORE',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }
}
