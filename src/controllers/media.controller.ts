import { Request, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { auditService } from '../services/audit.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/media/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|wav|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export class MediaController {
  async upload(req: AuthRequest, res: Response) {
    try {
      const uploadSingle = upload.single('file');
      
      uploadSingle(req, res, async (err: any) => {
        if (err) {
          throw new AppError(400, err.message);
        }

        if (!req.file) {
          throw new AppError(400, 'No file uploaded');
        }

        const { altText, description } = req.body;
        
        const data = await mediaService.create({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          altText,
          description
        }, req.user!.userId);

        await auditService.logAction({
          userId: req.user!.userId,
          action: 'MEDIA_UPLOAD',
          entity: 'MEDIA_ASSET',
          entityId: data.id,
          newValues: data,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        res.status(201).json(data);
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadMultiple(req: AuthRequest, res: Response) {
    try {
      const uploadMultiple = upload.array('files', 5); // Max 5 files
      
      uploadMultiple(req, res, async (err: any) => {
        if (err) {
          throw new AppError(400, err.message);
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          throw new AppError(400, 'No files uploaded');
        }

        const files = req.files.map((file: any) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path
        }));

        const data = await mediaService.createMultiple(files, req.user!.userId);

        await auditService.logAction({
          userId: req.user!.userId,
          action: 'MEDIA_BULK_UPLOAD',
          entity: 'MEDIA_ASSET',
          newValues: { count: data.length },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });

        res.status(201).json({
          message: `Uploaded ${data.length} files successfully`,
          data
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const data = await mediaService.getById(id);

    if (!data) {
      throw new AppError(404, 'Media asset not found');
    }

    res.json(data);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { altText, description } = req.body;
    
    const data = await mediaService.update(id, { altText, description }, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'MEDIA_UPDATE',
      entity: 'MEDIA_ASSET',
      entityId: id,
      newValues: data,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json(data);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const oldData = await mediaService.getById(id);

    if (!oldData) {
      throw new AppError(404, 'Media asset not found');
    }

    await mediaService.delete(id, req.user!.userId);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'MEDIA_DELETE',
      entity: 'MEDIA_ASSET',
      entityId: id,
      oldValues: oldData,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ message: 'Media asset deleted successfully' });
  }

  async serve(req: Request, res: Response) {
    const { id } = req.params;
    const media = await mediaService.getById(id);

    if (!media) {
      throw new AppError(404, 'Media asset not found');
    }

    res.sendFile(media.path, { root: '.' });
  }

  async list(req: Request, res: Response) {
    const { page = 1, limit = 20, mimeType, search } = req.query;

    const where: any = {};

    if (mimeType) {
      where.mimeType = { contains: mimeType as string };
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search as string, mode: 'insensitive' } },
        { altText: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      mediaService.list(where, parseInt(page as string), parseInt(limit as string)),
      mediaService.count(where)
    ]);

    res.json({
      data,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
  }
}
