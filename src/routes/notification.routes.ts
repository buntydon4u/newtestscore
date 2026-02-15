import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new NotificationController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Notification CRUD
router.get('/', asyncHandler(controller.list.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id/read', asyncHandler(controller.markAsRead.bind(controller)));
router.put('/read-all', asyncHandler(controller.markAllAsRead.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

// Notification utilities
router.get('/unread/count', asyncHandler(controller.getUnreadCount.bind(controller)));
router.post('/send-scheduled', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.sendScheduledNotifications.bind(controller)));
router.post('/bulk', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createBulk.bind(controller)));

// Filter and search
router.get('/type/:type', asyncHandler(controller.getByType.bind(controller)));
router.get('/search', asyncHandler(controller.search.bind(controller)));

export default router;
