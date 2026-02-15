import { Router } from 'express';
import { DynamicAssemblyController } from '../controllers/dynamicAssembly.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new DynamicAssemblyController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Paper generation
router.post('/exams/:id/generate-paper', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.generatePaper.bind(controller)));
router.get('/exams/:id/generated-paper', asyncHandler(controller.getGeneratedPaper.bind(controller)));
router.post('/attempts/:id/generate-questions', roleMiddleware('STUDENT'), asyncHandler(controller.generateQuestionsForAttempt.bind(controller)));

// Taxonomy and metadata
router.get('/taxonomy/view', asyncHandler(controller.getTaxonomy.bind(controller)));
router.get('/delivery-types', asyncHandler(controller.getDeliveryTypes.bind(controller)));

// Blueprint operations
router.post('/blueprints/:id/validate', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.validateBlueprint.bind(controller)));
router.get('/blueprints/:id/preview', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.previewQuestions.bind(controller)));
router.get('/blueprints/:id/question-pool', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getQuestionPool.bind(controller)));
router.post('/blueprints/:id/optimize', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.optimizeBlueprint.bind(controller)));
router.get('/blueprints/:id/validate-pool', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.validateQuestionPool.bind(controller)));
router.post('/blueprints/:id/analyze', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.analyzeQuestionDistribution.bind(controller)));

// Adaptive and practice modes
router.post('/attempts/:attemptId/sections/:sectionId/adaptive', roleMiddleware('STUDENT'), asyncHandler(controller.generateAdaptiveQuestions.bind(controller)));
router.post('/blueprints/:blueprintId/generate-practice', roleMiddleware('STUDENT', 'TEACHER'), asyncHandler(controller.generatePracticePaper.bind(controller)));

// Question operations
router.post('/exams/:examId/shuffle', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.shuffleQuestions.bind(controller)));
router.post('/exams/:examId/generate-section-wise', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.generateSectionWise.bind(controller)));
router.get('/questions/:questionId/similar', asyncHandler(controller.getSimilarQuestions.bind(controller)));
router.post('/questions/:questionId/generate-variations', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.generateVariations.bind(controller)));

export default router;
