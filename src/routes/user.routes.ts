import { Router, Request, Response } from 'express';
import multer from 'multer';
import { userService } from '../services/user.service.js';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for external upload
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userService.getUserProfile(req.user!.userId);

    res.status(200).json({
      message: 'Profile retrieved successfully',
      data: profile,
    });
  })
);

router.put(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const oldProfile = await userService.getUserProfile(req.user!.userId);

    const updatedProfile = await userService.updateProfile(req.user!.userId, req.body);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PROFILE_UPDATE',
      entity: 'USER_PROFILE',
      entityId: req.user!.userId,
      oldValues: oldProfile.profile,
      newValues: updatedProfile,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  })
);

router.get(
  '/preferences',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(req.user!.userId);

    res.status(200).json({
      message: 'Preferences retrieved successfully',
      data: user.preferences,
    });
  })
);

router.put(
  '/preferences',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(req.user!.userId);
    const oldPreferences = user.preferences;

    const updatedPreferences = await userService.updatePreferences(req.user!.userId, req.body);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PREFERENCES_UPDATE',
      entity: 'USER_PREFERENCES',
      entityId: req.user!.userId,
      oldValues: oldPreferences,
      newValues: updatedPreferences,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Preferences updated successfully',
      data: updatedPreferences,
    });
  })
);

router.post(
  '/addresses',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const address = await userService.addAddress(req.user!.userId, req.body);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ADDRESS_CREATE',
      entity: 'USER_ADDRESS',
      entityId: address.id,
      newValues: address,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'Address added successfully',
      data: address,
    });
  })
);

router.get(
  '/addresses',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const addresses = await userService.getAddresses(req.user!.userId);

    res.status(200).json({
      message: 'Addresses retrieved successfully',
      data: addresses,
    });
  })
);

router.put(
  '/addresses/:addressId',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { addressId } = req.params;

    const oldAddress = await userService.getAddresses(req.user!.userId);
    const address = oldAddress.find((a: any) => a.id === addressId);

    if (!address) {
      throw new AppError(404, 'Address not found');
    }

    const updatedAddress = await userService.updateAddress(req.user!.userId, addressId, req.body);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ADDRESS_UPDATE',
      entity: 'USER_ADDRESS',
      entityId: addressId,
      oldValues: address,
      newValues: updatedAddress,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Address updated successfully',
      data: updatedAddress,
    });
  })
);

router.delete(
  '/addresses/:addressId',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { addressId } = req.params;

    const addresses = await userService.getAddresses(req.user!.userId);
    const address = addresses.find((a: any) => a.id === addressId);

    if (!address) {
      throw new AppError(404, 'Address not found');
    }

    await userService.deleteAddress(req.user!.userId, addressId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'ADDRESS_DELETE',
      entity: 'USER_ADDRESS',
      entityId: addressId,
      oldValues: address,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Address deleted successfully',
    });
  })
);

router.post(
  '/documents',
  authMiddleware,
  upload.single('file'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError(400, 'File is required');
    }

    const file = req.file;
    const documentData = {
      type: req.body.type,
      title: req.body.title || file.originalname,
      description: req.body.description,
      fileName: file.originalname,
      filePath: `uploads/${Date.now()}-${file.originalname}`, // Placeholder path
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    const document = await userService.uploadDocument(req.user!.userId, documentData);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'DOCUMENT_UPLOAD',
      entity: 'USER_DOCUMENT',
      entityId: document.id,
      newValues: document,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      data: document,
    });
  })
);

router.get(
  '/documents',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const documents = await userService.getDocuments(req.user!.userId);

    res.status(200).json({
      message: 'Documents retrieved successfully',
      data: documents,
    });
  })
);

router.put(
  '/documents/:documentId',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { documentId } = req.params;

    const oldDocument = await userService.getDocuments(req.user!.userId);
    const document = oldDocument.find((d: any) => d.id === documentId);

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    const updatedDocument = await userService.updateDocument(req.user!.userId, documentId, req.body);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'DOCUMENT_UPDATE',
      entity: 'USER_DOCUMENT',
      entityId: documentId,
      oldValues: document,
      newValues: updatedDocument,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Document updated successfully',
      data: updatedDocument,
    });
  })
);

router.delete(
  '/documents/:documentId',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { documentId } = req.params;
    const documents = await userService.getDocuments(req.user!.userId);
    const document = documents.find((d: any) => d.id === documentId);

    if (!document) {
      throw new AppError(404, 'Document not found');
    }

    await userService.deleteDocument(req.user!.userId, documentId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'DOCUMENT_DELETE',
      entity: 'USER_DOCUMENT',
      entityId: documentId,
      oldValues: document,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Document deleted successfully',
    });
  })
);

export default router;
