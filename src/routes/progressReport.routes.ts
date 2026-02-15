import { Router } from 'express';
import { ProgressReportController } from '../controllers/progressReport.controller.js';
import { roleMiddleware, authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const controller = new ProgressReportController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Progress report CRUD
router.get('/users/:userId/reports', asyncHandler(controller.getReports.bind(controller)));
router.post('/users/:userId/reports', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER', 'STUDENT'), asyncHandler(controller.generateReport.bind(controller)));
router.get('/reports/:id', asyncHandler(controller.getReport.bind(controller)));
router.put('/reports/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.updateReport.bind(controller)));
router.delete('/reports/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.deleteReport.bind(controller)));

// Predefined reports
router.get('/users/:userId/reports/weekly', asyncHandler(controller.getWeeklyProgress.bind(controller)));
router.get('/users/:userId/reports/monthly', asyncHandler(controller.getMonthlyProgress.bind(controller)));
router.get('/users/:userId/reports/subject-wise', asyncHandler(controller.getSubjectWiseProgress.bind(controller)));
router.get('/users/:userId/reports/overall', asyncHandler(controller.getOverallProgress.bind(controller)));

// Progress analytics
router.get('/users/:userId/progress/chart', asyncHandler(controller.getProgressChart.bind(controller)));
router.get('/users/:userId/progress/compare', asyncHandler(controller.compareProgress.bind(controller)));
router.get('/users/:userId/progress/strengths', asyncHandler(controller.getStrengthsAndImprovements.bind(controller)));

// Bulk operations
router.post('/reports/bulk', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.generateBulkReports.bind(controller)));

export default router;
