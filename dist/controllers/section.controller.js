import { sectionService } from '../services/section.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class SectionController {
    async list(req, res) {
        const { page = 1, limit = 10, sort, search, ...filters } = req.query;
        const where = {
            isDeleted: false,
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
                where.name = {
                    contains: search,
                    mode: 'insensitive'
                };
            }
        }
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                where[key] = filters[key];
            }
        });
        const orderBy = sort ? { [sort]: 'asc' } : { createdAt: 'desc' };
        const [data, total] = await Promise.all([
            sectionService.list(where, orderBy, parseInt(page), parseInt(limit)),
            sectionService.count(where)
        ]);
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
        const data = await sectionService.getById(id);
        if (!data) {
            throw new AppError(404, 'Section not found');
        }
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await sectionService.create(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'SECTION_CREATE',
            entity: 'SECTION',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:section:*');
        const { deletedBy, ...sanitized } = data;
        res.status(201).json(sanitized);
    }
    async update(req, res) {
        const { id } = req.params;
        const oldData = await sectionService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Section not found');
        }
        const data = await sectionService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'SECTION_UPDATE',
            entity: 'SECTION',
            entityId: id,
            oldValues: oldData,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:section:*');
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await sectionService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Section not found');
        }
        await sectionService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'SECTION_DELETE',
            entity: 'SECTION',
            entityId: id,
            oldValues: oldData,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:section:*');
        res.json({ message: 'Section deleted successfully' });
    }
}
//# sourceMappingURL=section.controller.js.map