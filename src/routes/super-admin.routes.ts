import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const router = Router();

// Middleware to check if user is SUPER_ADMIN
const superAdminMiddleware = asyncHandler(async (req: AuthRequest, res: Response, next: any) => {
  if (req.user!.role !== 'SUPER_ADMIN') {
    throw new AppError(403, 'Access denied. Super admin privileges required.');
  }
  next();
});

// GET /api/super-admin/users - List all users (excluding soft deleted)
router.get(
  '/users',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: users,
    });
  })
);

// GET /api/super-admin/users/:id - Get single user
router.get(
  '/users/:id',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      data: user,
    });
  })
);

// POST /api/super-admin/users - Create new user
router.post(
  '/users',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, username, password, role, status, firstName, lastName } = req.body;

    if (!email || !username || !password || !role) {
      throw new AppError(400, 'Email, username, password, and role are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
        isDeleted: false,
      },
    });

    if (existingUser) {
      throw new AppError(409, existingUser.email === email ? 'Email already exists' : 'Username already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
        status: status || 'ACTIVE',
        profile: {
          create: {
            firstName: firstName || '',
            lastName: lastName || '',
          },
        },
        preferences: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'USER_CREATE',
      entity: 'USER',
      entityId: user.id,
      newValues: user,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'User created successfully',
      data: user,
    });
  })
);

// PUT /api/super-admin/users/:id - Update user
router.put(
  '/users/:id',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { email, username, role, status, firstName, lastName } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existingUser) {
      throw new AppError(404, 'User not found');
    }

    // Check for conflicts if email or username changed
    if (email !== existingUser.email || username !== existingUser.username) {
      const conflict = await prisma.user.findFirst({
        where: {
          OR: [
            email !== existingUser.email ? { email } : {},
            username !== existingUser.username ? { username } : {},
          ].filter(obj => Object.keys(obj).length > 0),
          isDeleted: false,
          id: { not: id },
        },
      });

      if (conflict) {
        throw new AppError(409, conflict.email === email ? 'Email already exists' : 'Username already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email,
        username,
        role,
        status,
        profile: {
          update: {
            firstName,
            lastName,
          },
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        updatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'USER_UPDATE',
      entity: 'USER',
      entityId: id,
      oldValues: {
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
        status: existingUser.status,
      },
      newValues: updatedUser,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  })
);

// DELETE /api/super-admin/users/:id - Soft delete user
router.delete(
  '/users/:id',
  authMiddleware,
  superAdminMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user!.userId,
      },
    });

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'USER_DELETE',
      entity: 'USER',
      entityId: id,
      oldValues: user,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'User deleted successfully',
    });
  })
);

export default router;