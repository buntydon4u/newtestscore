import { topicService } from '../services/topic.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class TopicController {
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
            topicService.list(where, orderBy, parseInt(page), parseInt(limit)),
            topicService.count(where)
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
        const data = await topicService.getById(id);
        if (!data) {
            throw new AppError(404, 'Topic not found');
        }
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await topicService.create(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'TOPIC_CREATE',
            entity: 'TOPIC',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:topic:*');
        const { deletedBy, ...sanitized } = data;
        res.status(201).json(sanitized);
    }
    async update(req, res) {
        const { id } = req.params;
        const oldData = await topicService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Topic not found');
        }
        const data = await topicService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'TOPIC_UPDATE',
            entity: 'TOPIC',
            entityId: id,
            oldValues: oldData,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:topic:*');
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await topicService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Topic not found');
        }
        await topicService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'TOPIC_DELETE',
            entity: 'TOPIC',
            entityId: id,
            oldValues: oldData,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:topic:*');
        res.json({ message: 'Topic deleted successfully' });
    }
}
//# sourceMappingURL=topic.controller.js.map