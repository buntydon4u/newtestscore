import { Request, Response } from 'express';
import { examAttemptService } from '../services/examAttempt.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class ExamAttemptController {
  async startAttempt(req: AuthRequest, res: Response) {
    const { examId } = req.params;
    const { scheduleId } = req.body;
    
    const data = await examAttemptService.startAttempt(examId, scheduleId, req.user!.userId);

    if (!data) {
      throw new AppError(500, 'Failed to start attempt');
    }

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_ATTEMPT_START',
      entity: 'EXAM_ATTEMPT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async getAttempt(req: Request, res: Response) {
    const { id } = req.params;
    const data = await examAttemptService.getAttempt(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Attempt not found');
    }

    res.json(data);
  }

  async resumeAttempt(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    const data = await examAttemptService.resumeAttempt(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_ATTEMPT_RESUME',
      entity: 'EXAM_ATTEMPT',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async submitAttempt(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { answers } = req.body;
    
    const data = await examAttemptService.submitAttempt(id, answers, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_ATTEMPT_SUBMIT',
      entity: 'EXAM_ATTEMPT',
      entityId: id,
      newValues: { submittedAt: new Date() },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getAttemptSections(req: Request, res: Response) {
    const { id } = req.params;
    const data = await examAttemptService.getAttemptSections(id, req.user?.userId);

    res.json(data);
  }

  async startSection(req: AuthRequest, res: Response) {
    const { id, sectionId } = req.params;
    
    const data = await examAttemptService.startSection(id, sectionId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'SECTION_ATTEMPT_START',
      entity: 'SECTION_ATTEMPT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async submitSection(req: AuthRequest, res: Response) {
    const { id, sectionId } = req.params;
    
    const data = await examAttemptService.submitSection(id, sectionId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'SECTION_ATTEMPT_SUBMIT',
      entity: 'SECTION_ATTEMPT',
      entityId: data.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getAttemptQuestions(req: Request, res: Response) {
    const { id } = req.params;
    const { sectionId } = req.query;
    
    const data = await examAttemptService.getAttemptQuestions(
      id, 
      sectionId as string, 
      req.user?.userId
    );

    res.json(data);
  }

  async saveAnswer(req: AuthRequest, res: Response) {
    const { id, questionId } = req.params;
    const { answer, timeTaken } = req.body;
    
    const data = await examAttemptService.saveAnswer(
      id, 
      questionId, 
      answer, 
      timeTaken, 
      req.user!.userId
    );

    res.json(data);
  }

  async getAnswers(req: Request, res: Response) {
    const { id } = req.params;
    const { sectionId } = req.query;
    
    const data = await examAttemptService.getAnswers(id, sectionId as string, req.user?.userId);

    res.json(data);
  }

  async submitAllAnswers(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { answers } = req.body;
    
    const data = await examAttemptService.submitAllAnswers(id, answers, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_ATTEMPT_SUBMIT_ALL',
      entity: 'EXAM_ATTEMPT',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getRemainingTime(req: Request, res: Response) {
    const { id } = req.params;
    
    const data = await examAttemptService.getRemainingTime(id, req.user?.userId);

    res.json(data);
  }

  async getStatus(req: Request, res: Response) {
    const { id } = req.params;
    const data = await examAttemptService.getStatus(id, req.user?.userId);

    if (!data) {
      throw new AppError(404, 'Attempt not found');
    }

    res.json(data);
  }

  async updateTime(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { timeSpent } = req.body;
    
    await examAttemptService.updateTime(id, timeSpent, req.user!.userId);

    res.json({ message: 'Time updated successfully' });
  }

  async pauseAttempt(req: AuthRequest, res: Response) {
    const { id } = req.params;
    
    const data = await examAttemptService.pauseAttempt(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'EXAM_ATTEMPT_PAUSE',
      entity: 'EXAM_ATTEMPT',
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async getUserAttempts(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, examId } = req.query;

    const effectiveUserId = userId || req.user?.userId;
    if (!effectiveUserId) {
      throw new AppError(400, 'User id is required');
    }
    
    const data = await examAttemptService.getUserAttempts(
      effectiveUserId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        examId: examId as string
      }
    );

    res.json(data);
  }

  async listExamAttempts(req: AuthRequest, res: Response) {
    const { page = 1, limit = 10, status, examId } = req.query;

    if (!examId) {
      throw new AppError(400, 'examId is required');
    }

    const data = await examAttemptService.getUserAttempts(
      req.user!.userId,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        examId: examId as string
      }
    );

    res.json(data);
  }

  async getExamResults(req: Request, res: Response) {
    const { examId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const data = await examAttemptService.getExamResults(
      examId,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(data);
  }
}
