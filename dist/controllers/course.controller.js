import { courseService } from '../services/course.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class CourseController {
    async list(req, res) {
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        // Build where clause
        const where = {
            isDeleted: false,
            isActive: true,
        };
        // Add search filters
        if (search) {
            // Assuming search is JSON string with column filters
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
                // If not JSON, search in name
                where.name = {
                    contains: search,
                    mode: 'insensitive'
                };
            }
        }
        // Add other filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                where[key] = filters[key];
            }
        });
        const orderBy = sort ? { [sort]: 'asc' } : { createdAt: 'desc' };
        const [data, total] = await Promise.all([
            courseService.list(where, orderBy, parseInt(page), parseInt(limit)),
            courseService.count(where)
        ]);
        // Remove sensitive fields
        const sanitizedData = data.map(item => {
            const { deletedBy, ...rest } = item;
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
        const data = await courseService.getById(id);
        if (!data) {
            throw new AppError(404, 'Course not found');
        }
        // Remove sensitive fields
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await courseService.create(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'COURSE_CREATE',
            entity: 'COURSE',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:list:course:*');
        await cacheDeletePattern('cache:course:*');
        // Remove sensitive fields
        const { deletedBy, ...sanitized } = data;
        res.status(201).json(sanitized);
    }
    async update(req, res) {
        const { id } = req.params;
        const oldData = await courseService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Course not found');
        }
        const data = await courseService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'COURSE_UPDATE',
            entity: 'COURSE',
            entityId: id,
            oldValues: oldData,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:course:*');
        // Remove sensitive fields
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await courseService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Course not found');
        }
        await courseService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'COURSE_DELETE',
            entity: 'COURSE',
            entityId: id,
            oldValues: oldData,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:course:*');
        res.json({ message: 'Course deleted successfully' });
    }
}
//# sourceMappingURL=course.controller.js.map