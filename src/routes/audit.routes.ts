import { Router, Request, Response } from 'express';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

router.get(
  '/my-logs',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit = '50', offset = '0' } = req.query;
    const logs = await auditService.getUserAuditLogs(
      req.user!.userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  })
);

router.get(
  '/user/:userId',
  authMiddleware,
  roleMiddleware('ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    const logs = await auditService.getUserAuditLogs(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  })
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId, action, entity, startDate, endDate, limit = '50', offset = '0' } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (entity) filters.entity = entity;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = await auditService.getAuditLogs(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  })
);

export default router;
