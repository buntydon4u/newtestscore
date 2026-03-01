import { Router } from 'express';
import { ScoringController } from '../controllers/scoring.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new ScoringController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Scoring and evaluation
router.post('/attempts/:id/evaluate', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.evaluateAttempt.bind(controller)));
router.get('/attempts/:id/score', asyncHandler(controller.getScore.bind(controller)));
router.get('/attempts/:id/results', asyncHandler(controller.getResults.bind(controller)));
router.get('/attempts/:id/section-scores', asyncHandler(controller.getSectionScores.bind(controller)));

// User scoring history
router.get('/me', asyncHandler(controller.getMyScoreSummary.bind(controller)));
router.get('/user/:userId', asyncHandler(controller.getUserScoreSummary.bind(controller)));
router.get('/users/:userId/scores', asyncHandler(controller.getUserAttemptHistory.bind(controller)));
router.get('/exams/:examId/results', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getExamResults.bind(controller)));
router.get('/exams/:examId/leaderboard', asyncHandler(controller.getLeaderboard.bind(controller)));
router.get('/exams/:examId/statistics', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getStatistics.bind(controller)));

// Manual grading
router.put('/attempts/:attemptId/questions/:questionId/score', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateManualScore.bind(controller)));
router.post('/attempts/:attemptId/bulk-grade', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.bulkGrade.bind(controller)));
router.post('/attempts/:id/recompute', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.recomputeScore.bind(controller)));

export default router;
