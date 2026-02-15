import { Request, Response } from 'express';
import { passageService } from '../services/passage.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class PassageController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 10, search } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      passageService.list(where, parseInt(page as string), parseInt(limit as string)),
      passageService.count(where)
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
    const data = await passageService.getById(id);

    if (!data) {
      throw new AppError(404, 'Passage not found');
    }

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await passageService.create(req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PASSAGE_CREATE',
      entity: 'PASSAGE',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:passage:*');

    res.status(201).json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await passageService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Passage not found');
    }

    const data = await passageService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PASSAGE_UPDATE',
      entity: 'PASSAGE',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:passage:*');

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await passageService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Passage not found');
    }

    await passageService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PASSAGE_DELETE',
      entity: 'PASSAGE',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:passage:*');

    res.json({ message: 'Passage deleted successfully' });
  }

  async getQuestions(req: Request, res: Response) {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const questions = await passageService.getQuestions(
      id,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(questions);
  }
}
