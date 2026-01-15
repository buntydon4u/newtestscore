import { Request, Response } from 'express';
import { teacherService } from '../services/teacher.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

export class TeacherController {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 10, sort, search, ...filters } = req.query;

    const where: any = {
      role: 'TEACHER',
      isDeleted: false,
      isActive: true,
    };

    if (search) {
      try {
        const searchFilters = typeof search === 'string' ? JSON.parse(search) : search;
        Object.keys(searchFilters).forEach(key => {
          if (searchFilters[key]) {
            where[key] = {
              contains: searchFilters[key],
              mode: 'insensitive'
            };
          }
        });
      } catch (e) {
        where.OR = [
          { username: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { profile: { firstName: { contains: search as string, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search as string, mode: 'insensitive' } } },
        ];
      }
    }

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        where[key] = filters[key];
      }
    });

    const orderBy = sort ? { [sort as string]: 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      teacherService.list(where, orderBy, parseInt(page as string), parseInt(limit as string)),
      teacherService.count(where)
    ]);

    const sanitizedData = data.map(item => {
      const { password, deletedBy, ...rest } = item;
      return rest;
    });

    res.json({
      data: sanitizedData,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await teacherService.getById(id);

    if (!data || data.role !== 'TEACHER') {
      throw new AppError(404, 'Teacher not found');
    }

    const { password, deletedBy, ...sanitized } = data;

    res.json(sanitized);
  }

  async create(req: AuthRequest, res: Response) {
    const data = await teacherService.create({ ...req.body, role: 'TEACHER' }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TEACHER_CREATE',
      entity: 'USER',
      entityId: data.id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:teacher:*');

    const { password, deletedBy, ...sanitized } = data;

    res.status(201).json(sanitized);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await teacherService.getById(id);

    if (!oldData || oldData.role !== 'TEACHER') {
      throw new AppError(404, 'Teacher not found');
    }

    const data = await teacherService.update(id, req.body, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TEACHER_UPDATE',
      entity: 'USER',
      entityId: id,
      oldValues: oldData,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:teacher:*');

    const { password, deletedBy, ...sanitized } = data;

    res.json(sanitized);
  }

  async softDelete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await teacherService.getById(id);

    if (!oldData || oldData.role !== 'TEACHER') {
      throw new AppError(404, 'Teacher not found');
    }

    await teacherService.softDelete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'TEACHER_DELETE',
      entity: 'USER',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await cacheDeletePattern('cache:teacher:*');

    res.json({ message: 'Teacher deleted successfully' });
  }
}