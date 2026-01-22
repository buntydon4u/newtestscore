import { Router } from 'express';
import { PackageController } from '../controllers/packageController.js';

const router = Router();
const packageController = new PackageController();

// Educational data routes (must be before /:id to avoid conflicts)
router.get('/classes', packageController.getClasses);
router.get('/classes/list', packageController.getClasses);
router.get('/streams', packageController.getStreams);
router.get('/streams/list', packageController.getStreams);
router.get('/subjects', packageController.getSubjects);
router.get('/subjects/list', packageController.getSubjects);

// Student access routes
router.get('/student/:studentId/packages', packageController.getStudentPackages);
router.get('/student/:studentId/access/:packageId', packageController.checkStudentAccess);

// Package CRUD routes
router.get('/', packageController.getPackages);
router.get('/:id', packageController.getPackageById);
router.post('/', packageController.createPackage);
router.put('/:id', packageController.updatePackage);
router.delete('/:id', packageController.deletePackage);

export default router;
