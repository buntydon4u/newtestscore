import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import multer from 'multer';
const router = Router();
const controller = new ExamController();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Apply authentication middleware to all routes
router.use(authMiddleware);
// Enrollment routes (declare before /:id)
router.get('/my/enrollments', roleMiddleware('STUDENT'), asyncHandler(controller.myEnrollments.bind(controller)));
router.post('/:examId/schedules/:scheduleId/enroll', roleMiddleware('STUDENT'), asyncHandler(controller.enroll.bind(controller)));
router.delete('/:examId/schedules/:scheduleId/enroll', roleMiddleware('STUDENT'), asyncHandler(controller.cancelEnrollment.bind(controller)));
router.get('/:examId/schedules/:scheduleId/enrollments', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.listEnrollments.bind(controller)));
// Schedule routes
router.get('/:id/schedules', asyncHandler(controller.listSchedules.bind(controller)));
router.post('/:id/schedules', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createSchedule.bind(controller)));
// Excel question upload (single combined paper)
router.post('/:id/upload-questions', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), upload.single('file'), asyncHandler(controller.uploadQuestions.bind(controller)));
// Dropdown data routes
router.get('/dropdown/boards', asyncHandler(controller.getBoards.bind(controller)));
router.get('/dropdown/series', asyncHandler(controller.getSeries.bind(controller)));
router.get('/dropdown/classes', asyncHandler(controller.getClasses.bind(controller)));
router.get('/dropdown/blueprints', asyncHandler(controller.getBlueprints.bind(controller)));
router.get('/dropdown/academic-boards', asyncHandler(controller.getAcademicBoards.bind(controller)));
// Create master data routes
router.post('/dropdown/boards', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createBoard.bind(controller)));
router.post('/dropdown/series', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createSeries.bind(controller)));
router.post('/dropdown/classes', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createClass.bind(controller)));
router.post('/dropdown/blueprints', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createBlueprint.bind(controller)));
router.post('/dropdown/academic-boards', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.createAcademicBoard.bind(controller)));
// CRUD routes
router.get('/', asyncHandler(controller.list.bind(controller)));
router.post('/', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.create.bind(controller)));
router.get('/:id', asyncHandler(controller.getById.bind(controller)));
router.put('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN', 'TEACHER'), asyncHandler(controller.softDelete.bind(controller)));
export default router;
//# sourceMappingURL=exam.routes.js.map