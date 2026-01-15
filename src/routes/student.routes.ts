import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
const studentController = new StudentController();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply admin role requirement to all routes
router.use(roleMiddleware('ADMIN', 'SUPER_ADMIN'));

// GET /api/students - List all students with pagination and search
router.get('/', asyncHandler(studentController.list.bind(studentController)));

// GET /api/students/:id - Get student by ID
router.get('/:id', asyncHandler(studentController.getById.bind(studentController)));

// POST /api/students - Create new student
router.post('/', asyncHandler(studentController.create.bind(studentController)));

// PUT /api/students/:id - Update student
router.put('/:id', asyncHandler(studentController.update.bind(studentController)));

// DELETE /api/students/:id - Soft delete student
router.delete('/:id', asyncHandler(studentController.softDelete.bind(studentController)));

export default router;
