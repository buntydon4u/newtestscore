import { Request, Response } from 'express';
import { questionBankService } from '../services/questionBank.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class QuestionBankController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 10, search, boardId, ...filters } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (boardId) {
      where.boardId = boardId;
    }

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        where[key] = filters[key];
      }
    });

    const [data, total] = await Promise.all([
      questionBankService.list(where, parseInt(page as string), parseInt(limit as string)),
      questionBankService.count(where)
    ]);

    res.json({
      data,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await questionBankService.getById(id);

    if (!data) {
      throw new AppError(404, 'Question bank not found');
    }

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await questionBankService.create(req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_BANK_CREATE',
      entity: 'QUESTION_BANK',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:questionBank:*');

    res.status(201).json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await questionBankService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Question bank not found');
    }

    const data = await questionBankService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_BANK_UPDATE',
      entity: 'QUESTION_BANK',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:questionBank:*');

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await questionBankService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Question bank not found');
    }

    await questionBankService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_BANK_DELETE',
      entity: 'QUESTION_BANK',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:questionBank:*');

    res.json({ message: 'Question bank deleted successfully' });
  }

  async getQuestions(req: Request, res: Response) {
    const { id } = req.params;
    const { page = 1, limit = 10, questionType, difficultyLevel, topicId } = req.query;

    const questions = await questionBankService.getQuestions(
      id,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        questionType: questionType as string,
        difficultyLevel: difficultyLevel as string,
        topicId: topicId as string
      }
    );

    res.json(questions);
  }
}
