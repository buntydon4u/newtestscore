import { examService } from '../services/exam.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class ExamController {
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
                where.title = {
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
            examService.list(where, orderBy, parseInt(page), parseInt(limit)),
            examService.count(where)
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
        const data = await examService.getById(id);
        if (!data) {
            throw new AppError(404, 'Exam not found');
        }
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await examService.create(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'EXAM_CREATE',
            entity: 'EXAM',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:exam:*');
        const { deletedBy, ...sanitized } = data;
        res.status(201).json(sanitized);
    }
    async update(req, res) {
        const { id } = req.params;
        const oldData = await examService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Exam not found');
        }
        const data = await examService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'EXAM_UPDATE',
            entity: 'EXAM',
            entityId: id,
            oldValues: oldData,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:exam:*');
        const { deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await examService.getById(id);
        if (!oldData) {
            throw new AppError(404, 'Exam not found');
        }
        await examService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'EXAM_DELETE',
            entity: 'EXAM',
            entityId: id,
            oldValues: oldData,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:exam:*');
        res.json({ message: 'Exam deleted successfully' });
    }
    // Get dropdown data
    async getBoards(req, res) {
        const boards = await examService.getBoards();
        res.json(boards);
    }
    async getSeries(req, res) {
        const { boardId } = req.query;
        const series = await examService.getSeries(boardId);
        res.json(series);
    }
    async getClasses(req, res) {
        const classes = await examService.getClasses();
        res.json(classes);
    }
    async getBlueprints(req, res) {
        const { classId } = req.query;
        const blueprints = await examService.getBlueprints(classId);
        res.json(blueprints);
    }
    async getAcademicBoards(req, res) {
        const boards = await examService.getAcademicBoards();
        res.json(boards);
    }
    // Create master data
    async createBoard(req, res) {
        const data = await examService.createBoard(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'BOARD_CREATE',
            entity: 'BOARD',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(data);
    }
    async createSeries(req, res) {
        const data = await examService.createSeries(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'SERIES_CREATE',
            entity: 'SERIES',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(data);
    }
    async createClass(req, res) {
        const data = await examService.createClass(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'CLASS_CREATE',
            entity: 'CLASS',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(data);
    }
    async createBlueprint(req, res) {
        const data = await examService.createBlueprint(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'BLUEPRINT_CREATE',
            entity: 'BLUEPRINT',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(data);
    }
    async createAcademicBoard(req, res) {
        const data = await examService.createAcademicBoard(req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'ACADEMIC_BOARD_CREATE',
            entity: 'ACADEMIC_BOARD',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        res.status(201).json(data);
    }
}
//# sourceMappingURL=exam.controller.js.map