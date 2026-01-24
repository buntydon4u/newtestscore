import { Router } from 'express';
import { PackageController } from '../controllers/packageController.js';

const router = Router();
const packageController = new PackageController();

// Educational data routes (must be before /:id to avoid conflicts)
router.get('/classes', packageController.getClasses);
router.get('/classes/list', packageController.getClasses);
router.get('/streams', packageController.getStreams);
router.get('/streams/list', packageController.getStreams);
router.post('/streams', packageController.createStream);
router.put('/streams/:id', packageController.updateStream);
router.delete('/streams/:id', packageController.deleteStream);
router.get('/subjects', packageController.getSubjects);
router.get('/subjects/list', packageController.getSubjects);
router.post('/subjects', packageController.createSubject);
router.put('/subjects/:id', packageController.updateSubject);
router.delete('/subjects/:id', packageController.deleteSubject);

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
