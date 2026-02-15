import { Router } from 'express';
import { ExamSectionController } from '../controllers/examSection.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new ExamSectionController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Exam section routes (nested under exams)
router.post('/:examId/sections', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createSection.bind(controller)));
router.put('/:examId/sections/:sectionId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateSection.bind(controller)));
router.delete('/:examId/sections/:sectionId', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.deleteSection.bind(controller)));

// Question assignment routes
router.post('/:examId/sections/:sectionId/questions', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.assignQuestions.bind(controller)));
router.put('/:examId/sections/:sectionId/questions/:questionId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateQuestionAssignment.bind(controller)));
router.delete('/:examId/sections/:sectionId/questions/:questionId', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.removeQuestion.bind(controller)));

// Section questions view
router.get('/:examId/sections/:sectionId/questions', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT'), asyncHandler(controller.getSectionQuestions.bind(controller)));

// Question management
router.post('/:examId/sections/:sectionId/reorder', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.reorderQuestions.bind(controller)));

// Exam structure
router.get('/:examId/structure', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT'), asyncHandler(controller.getExamStructure.bind(controller)));

// Section duplication
router.post('/:examId/sections/:sectionId/duplicate', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.duplicateSection.bind(controller)));

export default router;
