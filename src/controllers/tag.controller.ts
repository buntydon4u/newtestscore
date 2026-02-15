import { Request, Response } from 'express';
import { tagService } from '../services/tag.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class TagController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 100, search, category } = req.query;

    const where: any = {};

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    const [data, total] = await Promise.all([
      tagService.list(where, parseInt(page as string), parseInt(limit as string)),
      tagService.count(where)
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
    const data = await tagService.getById(id);

    if (!data) {
      throw new AppError(404, 'Tag not found');
    }

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await tagService.create(req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TAG_CREATE',
      entity: 'TAG',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:tag:*');

    res.status(201).json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await tagService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Tag not found');
    }

    const data = await tagService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TAG_UPDATE',
      entity: 'TAG',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:tag:*');

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await tagService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Tag not found');
    }

    await tagService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TAG_DELETE',
      entity: 'TAG',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:tag:*');

    res.json({ message: 'Tag deleted successfully' });
  }

  async tagQuestion(req: AuthRequest, res: Response) {
    const { questionId } = req.params;
    const { tagId } = req.body;

    const data = await tagService.tagQuestion(questionId, tagId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_TAG_CREATE',
      entity: 'QUESTION_TAG',
      newValues: { questionId, tagId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json(data);
  }

  async untagQuestion(req: AuthRequest, res: Response) {
    const { questionId, tagId } = req.params;

    await tagService.untagQuestion(questionId, tagId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'QUESTION_TAG_DELETE',
      entity: 'QUESTION_TAG',
      oldValues: { questionId, tagId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Tag removed from question successfully' });
  }

  async getQuestionTags(req: Request, res: Response) {
    const { questionId } = req.params;
    const data = await tagService.getQuestionTags(questionId);

    res.json(data);
  }

  async getPopularTags(req: Request, res: Response) {
    const { limit = 20 } = req.query;
    const data = await tagService.getPopularTags(parseInt(limit as string));

    res.json(data);
  }

  async getTaxonomy(req: Request, res: Response) {
    const { type } = req.query;
    const data = await tagService.getTaxonomy(type as string);

    res.json(data);
  }
}
