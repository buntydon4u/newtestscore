import { Router } from 'express';
import { PackageController } from '../controllers/packageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const packageController = new PackageController();

// Educational data routes (must be before /:id to avoid conflicts)
// GET routes - public access (optional auth for personalized data)
router.get('/classes', packageController.getClasses);
router.get('/classes/list', packageController.getClasses);
router.get('/streams', packageController.getStreams);
router.get('/streams/list', packageController.getStreams);
router.get('/subjects', packageController.getSubjects);
router.get('/subjects/list', packageController.getSubjects);

// POST/PUT/DELETE routes - require authentication
router.post('/streams', authMiddleware, packageController.createStream);
router.put('/streams/:id', authMiddleware, packageController.updateStream);
router.delete('/streams/:id', authMiddleware, packageController.deleteStream);
router.post('/subjects', authMiddleware, packageController.createSubject);
router.put('/subjects/:id', authMiddleware, packageController.updateSubject);
router.delete('/subjects/:id', authMiddleware, packageController.deleteSubject);

// Student access routes - require authentication
router.get('/student/:studentId/packages', authMiddleware, packageController.getStudentPackages);
router.get('/student/:studentId/access/:packageId', authMiddleware, packageController.checkStudentAccess);

// Package CRUD routes
// GET routes - public access (optional auth for personalized data)
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);

// POST/PUT/DELETE routes - require authentication
router.post('/', authMiddleware, packageController.createPackage);
router.put('/:id', authMiddleware, packageController.updatePackage);
router.delete('/:id', authMiddleware, packageController.deletePackage);

export default router;
