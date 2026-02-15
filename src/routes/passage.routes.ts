import { Router } from 'express';
import { PassageController } from '../controllers/passage.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new PassageController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Passage CRUD routes
router.get('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.list.bind(controller)));
router.get('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getById.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.delete.bind(controller)));

// Get questions in a passage
router.get('/:id/questions', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getQuestions.bind(controller)));

export default router;
