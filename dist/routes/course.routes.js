import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { courseService } from '../services/course.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
const router = Router();
const controller = new CourseController();
router.get('/', asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, filters } = req.query;
    // const filterHash = crypto.createHash('md5').update(JSON.stringify(req.query)).digest('hex');
    // const data = await cacheWrap(`cache:list:courses:${filterHash}`, 300, async () => {
    const where = { isDeleted: false, isActive: true };
    if (filters) {
        const filterObj = typeof filters === 'string' ? JSON.parse(filters) : filters;
        Object.keys(filterObj).forEach(key => {
            if (filterObj[key]) {
                where[key] = { contains: filterObj[key], mode: 'insensitive' };
            }
        });
    }
    const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const [listData, total] = await Promise.all([
        courseService.list(where, orderBy, skip, take),
        courseService.count(where)
    ]);
    const data = { data: listData, total, page: parseInt(page), limit: parseInt(limit) };
    // });
    res.json(data);
}));
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    // const data = await cacheWrap(`cache:course:${id}`, 3600, () => courseService.getById(id));
    const data = await courseService.getById(id);
    if (!data) {
        res.status(404).json({ message: 'Course not found' });
        return;
    }
    // Remove sensitive fields
    const { deletedBy, ...sanitized } = data;
    res.json(sanitized);
}));
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.softDelete.bind(controller)));
export default router;
//# sourceMappingURL=course.routes.js.map