import { Router } from 'express';
import { ProctorController } from '../controllers/proctor.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new ProctorController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Proctor event logging
router.post('/events', roleMiddleware('STUDENT', 'ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.logEvent.bind(controller)));
router.get('/attempts/:id/events', asyncHandler(controller.getAttemptEvents.bind(controller)));
router.get('/exams/:examId/events', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getExamEvents.bind(controller)));
router.get('/exams/:examId/summary', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getProctorSummary.bind(controller)));

// Live monitoring
router.get('/live-sessions', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getLiveSessions.bind(controller)));
router.get('/suspicious-events', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getSuspiciousEvents.bind(controller)));
router.get('/dashboard', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getProctorDashboard.bind(controller)));

// Event management
router.post('/events/:id/flag', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.flagEvent.bind(controller)));
router.post('/events/:id/resolve', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.resolveEvent.bind(controller)));
router.post('/events/bulk-flag', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.bulkFlagEvents.bind(controller)));

// Proctoring rules
router.get('/rules', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getRules.bind(controller)));
router.post('/rules', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.createRule.bind(controller)));
router.put('/rules/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.updateRule.bind(controller)));
router.delete('/rules/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), asyncHandler(controller.deleteRule.bind(controller)));

// Utilities
router.get('/event-types', asyncHandler(controller.getEventTypes.bind(controller)));
router.get('/students/:userId/proctoring', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.getStudentProctoring.bind(controller)));
router.get('/exams/:examId/export', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.exportProctorReport.bind(controller)));

export default router;
