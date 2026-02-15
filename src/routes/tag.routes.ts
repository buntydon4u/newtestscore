import { Router } from 'express';
import { TagController } from '../controllers/tag.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new TagController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Tag CRUD routes
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.delete.bind(controller)));

// Question tagging
router.post('/questions/:questionId/tag', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.tagQuestion.bind(controller)));
router.delete('/questions/:questionId/tags/:tagId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.untagQuestion.bind(controller)));
router.get('/questions/:questionId/tags', asyncHandler(controller.getQuestionTags.bind(controller)));

// Popular tags and taxonomy
router.get('/popular/list', asyncHandler(controller.getPopularTags.bind(controller)));
router.get('/taxonomy/view', asyncHandler(controller.getTaxonomy.bind(controller)));

export default router;
