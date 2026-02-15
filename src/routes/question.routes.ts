import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new QuestionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Question CRUD routes
router.get('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.list.bind(controller)));
router.get('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getById.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.delete.bind(controller)));

// Question options management
router.post('/:id/options', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.addOption.bind(controller)));
router.put('/:id/options/:optionId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateOption.bind(controller)));
router.delete('/:id/options/:optionId', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.deleteOption.bind(controller)));

// Bulk operations
router.post('/bulk', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.bulkCreate.bind(controller)));

export default router;
