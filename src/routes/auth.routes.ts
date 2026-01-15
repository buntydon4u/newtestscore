import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import { auditService } from '../services/audit.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { prisma } from '../config/database.js';
import crypto from 'crypto';
import { blacklistToken } from '../redis/tokenBlacklist.js';
import { redisHealth } from '../redis/index.js';

const router = Router();

router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      throw new AppError(400, 'Email, username, and password are required');
    }

    const result = await authService.signup(email, username, password);

    await auditService.logAction({
      userId: result.user.id,
      action: 'USER_SIGNUP',
      entity: 'USER',
      entityId: result.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: result,
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const result = await authService.login(email, password);

    await auditService.logAction({
      userId: result.user.id,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: result.user.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    // Find the session to get userId
    const session = await prisma.userSession.findUnique({
      where: { token: refreshToken },
    });

    if (!session) {
      throw new AppError(401, 'Invalid refresh token');
    }

    await authService.logout(session.userId, refreshToken);

    // Blacklist tokens - DISABLED
    // const authHeader = req.headers.authorization;
    // if (authHeader && authHeader.startsWith('Bearer ')) {
    //   const accessToken = authHeader.substring(7);
    //   const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    //   await blacklistToken(accessTokenHash, 15 * 60); // 15 min
    // }

    // const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // await blacklistToken(refreshTokenHash, 7 * 24 * 60 * 60); // 7 days

    await auditService.logAction({
      userId: session.userId,
      action: 'USER_LOGOUT',
      entity: 'USER',
      entityId: session.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Logout successful',
    });
  })
);

router.post(
  '/refresh-token',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    const result = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      message: 'Token refreshed successfully',
      data: result,
    });
  })
);

router.post(
  '/change-password',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError(400, 'Old and new passwords are required');
    }

    await authService.changePassword(req.user!.userId, oldPassword, newPassword);

    await auditService.logAction({
      userId: req.user!.userId,
      action: 'PASSWORD_CHANGE',
      entity: 'USER',
      entityId: req.user!.userId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      message: 'Password changed successfully',
    });
  })
);


router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    const result = await authService.forgotPassword(email);

    res.status(200).json({
      message: result.message,
    });
  })
);

router.post(
  '/verify-reset-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError(400, 'Email and OTP are required');
    }

    const result = await authService.verifyResetOtp(email, otp);

    res.status(200).json({
      message: result.message,
      data: { userId: result.userId },
    });
  })
);

router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new AppError(400, 'Email, OTP, and new password are required');
    }

    const result = await authService.resetPassword(email, otp, newPassword);

    res.status(200).json({
      message: result.message,
    });
  })
);

router.post(
  '/send-verify-otp',
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, 'Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    try {
      await authService.sendVerificationOtp(user.id);
      res.status(200).json({
        message: 'OTP sent successfully',
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to send OTP',
      });
    }
  })
);

router.post(
  '/verify-email',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      throw new AppError(400, 'User ID and OTP are required');
    }

    const result = await authService.verifyEmail(userId, otp);

    res.status(200).json({
      message: result.message,
    });
  })
);

// router.get(
//   '/health/redis',
//   asyncHandler(async (req: Request, res: Response) => {
//     const health = await redisHealth();
//     res.json({ redis: health });
//   })
// );

export default router;
