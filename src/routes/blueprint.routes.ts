import { Router } from 'express';
import { BlueprintController } from '../controllers/blueprint.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new BlueprintController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Blueprint CRUD routes
router.get('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.list.bind(controller)));
router.get('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getById.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.delete.bind(controller)));

// Blueprint rule management
router.post('/:id/rules', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.addRule.bind(controller)));
router.put('/:id/rules/:ruleId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateRule.bind(controller)));
router.delete('/:id/rules/:ruleId', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.deleteRule.bind(controller)));

// Blueprint validation and preview
router.post('/:id/validate', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.validate.bind(controller)));
router.get('/:id/preview', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.preview.bind(controller)));

// Blueprint operations
router.post('/:id/clone', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.clone.bind(controller)));
router.post('/:id/generate-paper', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.generatePaper.bind(controller)));

export default router;
