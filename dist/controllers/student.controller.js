import { studentService } from '../services/student.service.js';
import { auditService } from '../services/audit.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';
export class StudentController {
    async list(req, res) {
        const { page = 1, limit = 10, sortBy, sortOrder, filters, search } = req.query;
        const where = {
            role: 'STUDENT',
            isDeleted: false,
            isActive: true,
        };
        // Handle filters
        if (filters) {
            try {
                const parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
                const profileFilters = {};
                Object.keys(parsedFilters).forEach(key => {
                    if (parsedFilters[key]) {
                        if (key === 'name') {
                            where.OR = [
                                { profile: { firstName: { contains: parsedFilters[key], mode: 'insensitive' } } },
                                { profile: { lastName: { contains: parsedFilters[key], mode: 'insensitive' } } },
                            ];
                        }
                        else if (key === 'email') {
                            where.email = { contains: parsedFilters[key], mode: 'insensitive' };
                        }
                        else if (key === 'rollNumber') {
                            profileFilters.rollNumber = { contains: parsedFilters[key], mode: 'insensitive' };
                        }
                        else if (key === 'phone') {
                            profileFilters.primaryPhone = { contains: parsedFilters[key], mode: 'insensitive' };
                        }
                        else {
                            where[key] = parsedFilters[key];
                        }
                    }
                });
                // Apply profile filters if any exist
                if (Object.keys(profileFilters).length > 0) {
                    where.profile = profileFilters;
                }
            }
            catch (e) {
                // Invalid filters JSON, ignore
            }
        }
        // Handle search
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { profile: { firstName: { contains: search, mode: 'insensitive' } } },
                { profile: { lastName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        // Handle sorting
        const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { id: 'desc' };
        const [data, total] = await Promise.all([
            studentService.list(where, orderBy, parseInt(page), parseInt(limit)),
            studentService.count(where)
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
        const data = await studentService.getById(id);
        if (!data || data.role !== 'STUDENT') {
            throw new AppError(404, 'Student not found');
        }
        const { password, deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async create(req, res) {
        const data = await studentService.create({ ...req.body, role: 'STUDENT' }, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'STUDENT_CREATE',
            entity: 'USER',
            entityId: data.id,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:student:*');
        const { password, deletedBy, ...sanitized } = data;
        res.status(201).json(sanitized);
    }
    async update(req, res) {
        const { id } = req.params;
        const oldData = await studentService.getById(id);
        if (!oldData || oldData.role !== 'STUDENT') {
            throw new AppError(404, 'Student not found');
        }
        const data = await studentService.update(id, req.body, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'STUDENT_UPDATE',
            entity: 'USER',
            entityId: id,
            oldValues: oldData,
            newValues: data,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:student:*');
        const { password, deletedBy, ...sanitized } = data;
        res.json(sanitized);
    }
    async softDelete(req, res) {
        const { id } = req.params;
        const oldData = await studentService.getById(id);
        if (!oldData || oldData.role !== 'STUDENT') {
            throw new AppError(404, 'Student not found');
        }
        await studentService.softDelete(id, req.user.userId);
        await auditService.logAction({
            userId: req.user.userId,
            action: 'STUDENT_DELETE',
            entity: 'USER',
            entityId: id,
            oldValues: oldData,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
        await cacheDeletePattern('cache:student:*');
        res.json({ message: 'Student deleted successfully' });
    }
}
//# sourceMappingURL=student.controller.js.map