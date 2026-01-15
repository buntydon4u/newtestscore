import { Router } from 'express';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
const router = Router();
router.get('/my-logs', authMiddleware, asyncHandler(async (req, res) => {
    const { limit = '50', offset = '0' } = req.query;
    const logs = await auditService.getUserAuditLogs(req.user.userId, parseInt(limit), parseInt(offset));
    res.status(200).json({
        message: 'Audit logs retrieved successfully',
        data: logs,
    });
}));
router.get('/user/:userId', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;
    const logs = await auditService.getUserAuditLogs(userId, parseInt(limit), parseInt(offset));
    res.status(200).json({
        message: 'Audit logs retrieved successfully',
        data: logs,
    });
}));
router.get('/', authMiddleware, roleMiddleware('ADMIN'), asyncHandler(async (req, res) => {
    const { userId, action, entity, startDate, endDate, limit = '50', offset = '0' } = req.query;
    const filters = {};
    if (userId)
        filters.userId = userId;
    if (action)
        filters.action = action;
    if (entity)
        filters.entity = entity;
    if (startDate)
        filters.startDate = new Date(startDate);
    if (endDate)
        filters.endDate = new Date(endDate);
    const logs = await auditService.getAuditLogs(filters, parseInt(limit), parseInt(offset));
    res.status(200).json({
        message: 'Audit logs retrieved successfully',
        data: logs,
    });
}));
export default router;
//# sourceMappingURL=audit.routes.js.map