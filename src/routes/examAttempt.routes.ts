import { Router } from 'express';
import { ExamAttemptController } from '../controllers/examAttempt.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new ExamAttemptController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Attempt management
router.post('/exams/:examId/attempts', roleMiddleware('STUDENT'), asyncHandler(controller.startAttempt.bind(controller)));
router.get('/attempts/:id', asyncHandler(controller.getAttempt.bind(controller)));
router.post('/attempts/:id/resume', roleMiddleware('STUDENT'), asyncHandler(controller.resumeAttempt.bind(controller)));
router.post('/attempts/:id/submit', roleMiddleware('STUDENT'), asyncHandler(controller.submitAttempt.bind(controller)));

// Section management
router.get('/attempts/:id/sections', asyncHandler(controller.getAttemptSections.bind(controller)));
router.post('/attempts/:id/sections/:sectionId/start', roleMiddleware('STUDENT'), asyncHandler(controller.startSection.bind(controller)));
router.post('/attempts/:id/sections/:sectionId/submit', roleMiddleware('STUDENT'), asyncHandler(controller.submitSection.bind(controller)));

// Question and answer management
router.get('/attempts/:id/questions', asyncHandler(controller.getAttemptQuestions.bind(controller)));
router.post('/attempts/:id/questions/:questionId/answer', roleMiddleware('STUDENT'), asyncHandler(controller.saveAnswer.bind(controller)));
router.get('/attempts/:id/answers', asyncHandler(controller.getAnswers.bind(controller)));
router.post('/attempts/:id/submit-all', roleMiddleware('STUDENT'), asyncHandler(controller.submitAllAnswers.bind(controller)));

// Time management
router.get('/attempts/:id/time', asyncHandler(controller.getRemainingTime.bind(controller)));
router.get('/attempts/:id/status', asyncHandler(controller.getStatus.bind(controller)));
router.post('/attempts/:id/time/update', roleMiddleware('STUDENT'), asyncHandler(controller.updateTime.bind(controller)));
router.post('/attempts/:id/pause', roleMiddleware('STUDENT'), asyncHandler(controller.pauseAttempt.bind(controller)));

// User attempts
router.get('/users/:userId/attempts', asyncHandler(controller.getUserAttempts.bind(controller)));
router.get('/exam-attempts', roleMiddleware('STUDENT'), asyncHandler(controller.listExamAttempts.bind(controller)));
router.get('/exams/:examId/results', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getExamResults.bind(controller)));

export default router;
