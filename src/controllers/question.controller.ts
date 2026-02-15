import { Request, Response } from 'express';
import { questionService } from '../services/question.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class QuestionController {
  async list(req: Request, res: Response) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      questionBankId, 
      topicId, 
      questionType, 
      difficultyLevel,
      tags 
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { questionText: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (questionBankId) {
      where.questionBankId = questionBankId;
    }

    if (topicId) {
      where.topicId = topicId;
    }

    if (questionType) {
      where.questionType = questionType;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        some: {
          tag: {
            name: {
              in: tagArray as string[]
            }
          }
        }
      };
    }

    const [data, total] = await Promise.all([
      questionService.list(where, parseInt(page as string), parseInt(limit as string)),
      questionService.count(where)
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
    const data = await questionService.getById(id);

    if (!data) {
      throw new AppError(404, 'Question not found');
    }

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await questionService.create(req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_CREATE',
      entity: 'QUESTION',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:question:*');

    res.status(201).json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await questionService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Question not found');
    }

    const data = await questionService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_UPDATE',
      entity: 'QUESTION',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:question:*');

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await questionService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Question not found');
    }

    await questionService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_DELETE',
      entity: 'QUESTION',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:question:*');

    res.json({ message: 'Question deleted successfully' });
  }

  async addOption(req: AuthRequest, res: Response) {
    const { questionId } = req.params;
    const data = await questionService.addOption(questionId, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_OPTION_CREATE',
      entity: 'QUESTION_OPTION',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async updateOption(req: AuthRequest, res: Response) {
    const { questionId, optionId } = req.params;
    const data = await questionService.updateOption(optionId, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_OPTION_UPDATE',
      entity: 'QUESTION_OPTION',
      entityId: optionId,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async deleteOption(req: AuthRequest, res: Response) {
    const { questionId, optionId } = req.params;
    await questionService.deleteOption(optionId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_OPTION_DELETE',
      entity: 'QUESTION_OPTION',
      entityId: optionId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Option deleted successfully' });
  }

  async bulkCreate(req: AuthRequest, res: Response) {
    const { questions } = req.body;
    const data = await questionService.bulkCreate(questions, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_BULK_CREATE',
      entity: 'QUESTION',
      newValues: { count: data.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:question:*');

    res.status(201).json({
      message: `Created ${data.length} questions successfully`,
      data
    });
  }
}
