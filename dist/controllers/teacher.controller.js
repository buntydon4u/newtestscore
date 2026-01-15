import { teacherService } from '../services/teacher.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class TeacherController {
    async list(req, res) {
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const where = {
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
            }
            catch (e) {
                where.OR = [
                    { username: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { profile: { firstName: { contains: search, mode: 'insensitive' } } },
                    { profile: { lastName: { contains: search, mode: 'insensitive' } } },
                ];
            }
        }
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                where[key] = filters[key];
            }
        });
        const orderBy = sort ? { [sort]: 'asc' } : { createdAt: 'desc' };
        const [data, total] = await Promise.all([
            teacherService.list(where, orderBy, parseInt(page), parseInt(limit)),
            teacherService.count(where)
        ]);
        const sanitizedData = data.map(item => {
            const { password, deletedBy, ...rest } = item;
            return rest;
        });
        res.json({
            data: sanitizedData,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    }
    async getById(req, res) {
        const { id } = req.params;
        const data = await teacherService.getById(id);
        if (!data || data.role !== 'TEACHER') {
            throw new AppError(404, 'Teacher not found');
        }
        const { password, deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await teacherService.create({ ...req.body, role: 'TEACHER' }, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
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
    async update(req, res) {
        const { id } = req.params;
        const oldData = await teacherService.getById(id);
        if (!oldData || oldData.role !== 'TEACHER') {
            throw new AppError(404, 'Teacher not found');
        }
        const data = await teacherService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
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
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await teacherService.getById(id);
        if (!oldData || oldData.role !== 'TEACHER') {
            throw new AppError(404, 'Teacher not found');
        }
        await teacherService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
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
//# sourceMappingURL=teacher.controller.js.map