import { Request, Response } from 'express';
import { blueprintService } from '../services/blueprint.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class BlueprintController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 10, search, classId } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (classId) {
      where.classId = classId;
    }

    const [data, total] = await Promise.all([
      blueprintService.list(where, parseInt(page as string), parseInt(limit as string)),
      blueprintService.count(where)
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
    const data = await blueprintService.getById(id);

    if (!data) {
      throw new AppError(404, 'Blueprint not found');
    }

    res.json(data);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await blueprintService.create(req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_CREATE',
      entity: 'EXAM_BLUEPRINT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.status(201).json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await blueprintService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Blueprint not found');
    }

    const data = await blueprintService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_UPDATE',
      entity: 'EXAM_BLUEPRINT',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await blueprintService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Blueprint not found');
    }

    await blueprintService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_DELETE',
      entity: 'EXAM_BLUEPRINT',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.json({ message: 'Blueprint deleted successfully' });
  }

  async addRule(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = await blueprintService.addRule(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_RULE_CREATE',
      entity: 'BLUEPRINT_RULE',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.status(201).json(data);
  }

  async updateRule(req: AuthRequest, res: Response) {
    const { id, ruleId } = req.params;
    const oldData = await blueprintService.getRuleById(ruleId);

    if (!oldData) {
      throw new AppError(404, 'Blueprint rule not found');
    }

    const data = await blueprintService.updateRule(ruleId, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_RULE_UPDATE',
      entity: 'BLUEPRINT_RULE',
      entityId: ruleId,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.json(data);
  }

  async deleteRule(req: AuthRequest, res: Response) {
    const { id, ruleId } = req.params;
    const oldData = await blueprintService.getRuleById(ruleId);

    if (!oldData) {
      throw new AppError(404, 'Blueprint rule not found');
    }

    await blueprintService.deleteRule(ruleId, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_RULE_DELETE',
      entity: 'BLUEPRINT_RULE',
      entityId: ruleId,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.json({ message: 'Blueprint rule deleted successfully' });
  }

  async validate(req: Request, res: Response) {
    const { id } = req.params;
    const validation = await blueprintService.validate(id);

    res.json(validation);
  }

  async preview(req: Request, res: Response) {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const preview = await blueprintService.preview(id, parseInt(limit as string));

    res.json(preview);
  }

  async clone(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name } = req.body;
    
    const data = await blueprintService.clone(id, name, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'BLUEPRINT_CLONE',
      entity: 'EXAM_BLUEPRINT',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:blueprint:*');

    res.status(201).json(data);
  }

  async generatePaper(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { seed } = req.body;
    
    const paper = await blueprintService.generatePaper(id, seed);

    res.json(paper);
  }
}
