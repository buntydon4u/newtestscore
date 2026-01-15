import { Router, Request, Response } from 'express';
import { configService } from '../services/config.service.js';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { cacheDeletePattern } from '../redis/cacheWrap.js';

const router = Router();

router.get(
  '/:key',
  asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const config = await configService.getConfig(key);

    res.status(200).json({
      message: 'Configuration retrieved successfully',
      data: config,
    });
  })
);

router.get(
  '/get',
  asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.query;
    if (!key || typeof key !== 'string') {
      throw new AppError(400, 'Key parameter is required');
    }
    const config = await configService.getConfig(key);

    res.status(200).json({
      message: 'Configuration retrieved successfully',
      data: config,
    });
  })
);

router.get(
  '/',
  cacheMiddleware('system-configurations'),
  asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.query;
    const configs = await configService.getAllConfigs(category as string);

    res.status(200).json({
      message: 'Configurations retrieved successfully',
      data: configs,
    });
  })
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key, value, description, category } = req.body;

    if (!key || value === undefined) {
      throw new AppError(400, 'Key and value are required');
    }

    const config = await configService.setConfig(key, value, description, category);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'CONFIG_SET',
      entity: 'SYSTEM_CONFIGURATION',
      entityId: key,
      newValues: config,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Invalidate cache
    await cacheDeletePattern('cache:system-configurations:*');

    res.status(201).json({
      message: 'Configuration set successfully',
      data: config,
    });
  })
);

router.put(
  '/:key',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const { value, description, category } = req.body;

    if (value === undefined) {
      throw new AppError(400, 'Value is required');
    }

    const oldConfig = await configService.getConfig(key);
    const config = await configService.setConfig(key, value, description, category);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'CONFIG_UPDATE',
      entity: 'SYSTEM_CONFIGURATION',
      entityId: key,
      oldValues: oldConfig,
      newValues: config,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Invalidate cache
    await cacheDeletePattern('cache:system-configurations:*');

    res.status(200).json({
      message: 'Configuration updated successfully',
      data: config,
    });
  })
);

router.delete(
  '/:key',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const oldConfig = await configService.getConfig(key);

    await configService.deleteConfig(key);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'CONFIG_DELETE',
      entity: 'SYSTEM_CONFIGURATION',
      entityId: key,
      oldValues: oldConfig,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Invalidate cache
    await cacheDeletePattern('cache:system-configurations:*');

    res.status(200).json({
      message: 'Configuration deleted successfully',
    });
  })
);

router.patch(
  '/:key/toggle',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { key } = req.params;
    const oldConfig = await configService.getConfig(key);
    const config = await configService.toggleConfigStatus(key);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'CONFIG_TOGGLE',
      entity: 'SYSTEM_CONFIGURATION',
      entityId: key,
      oldValues: oldConfig,
      newValues: config,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Configuration status toggled successfully',
      data: config,
    });
  })
);

router.get(
  '/category/:category',
  asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const configs = await configService.getConfigsByCategory(category);

    res.status(200).json({
      message: 'Configurations retrieved successfully',
      data: configs,
    });
  })
);

export default router;
