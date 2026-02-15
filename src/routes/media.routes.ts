import { Router } from 'express';
import { MediaController } from '../controllers/media.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new MediaController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Media management routes
router.get('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.post('/upload', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.upload.bind(controller)));
router.post('/upload-multiple', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.uploadMultiple.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.delete.bind(controller)));

// Serve media files
router.get('/:id/serve', asyncHandler(controller.serve.bind(controller)));

export default router;
