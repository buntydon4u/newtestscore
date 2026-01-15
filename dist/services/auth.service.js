import { prisma } from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import { emailService } from './email.service.js';
export class AuthService {
    async signup(email, username, password) {
        const validation = validatePasswordStrength(password);
        if (!validation.isValid) {
            throw new AppError(400, 'Password does not meet requirements', {
                errors: validation.errors,
            });
        }
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            throw new AppError(409, existingUser.email === email
                ? 'Email already registered'
                : 'Username already taken');
        }
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'GUEST',
                status: 'PENDING',
                profile: {
                    create: {
                        firstName: '',
                        lastName: '',
                    },
                },
                preferences: {
                    create: {},
                },
            },
            include: {
                profile: true,
                preferences: true,
            },
        });
        // Generate and send OTP
        await this.sendVerificationOtp(user.id);
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            message: 'User registered successfully. Please check your email for verification code.',
        };
    }
    async login(email, password) {
        // Check rate limit - DISABLED
        // const loginAllowed = await checkLoginRateLimit(email);
        // if (!loginAllowed) {
        //   throw new AppError(429, 'Too many login attempts. Please try again later.');
        // }
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                preferences: true,
            },
        });
        if (!user) {
            throw new AppError(401, 'Invalid email or password');
        }
        if (user.status !== 'ACTIVE') {
            throw new AppError(403, 'Account not verified. Please check your email for verification code.');
        }
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid email or password');
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
            },
        });
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        await prisma.userSession.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: undefined,
            },
        });
        // await cache.set(`user:${user.id}`, user, 3600);
        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }
    async refreshTokens(refreshToken) {
        const session = await prisma.userSession.findUnique({
            where: { token: refreshToken },
        });
        if (!session || session.expiresAt < new Date()) {
            throw new AppError(401, 'Refresh token expired or invalid');
        }
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });
        if (!user) {
            throw new AppError(401, 'User not found');
        }
        const newAccessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            accessToken: newAccessToken,
            expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRY || '900'),
        };
    }
    async logout(userId, refreshToken) {
        await prisma.userSession.deleteMany({
            where: {
                userId,
                token: refreshToken,
            },
        });
        // await cache.del(`user:${userId}`);
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        const isPasswordValid = await comparePassword(oldPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError(401, 'Current password is incorrect');
        }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            throw new AppError(400, 'New password does not meet requirements', {
                errors: validation.errors,
            });
        }
        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        });
        await prisma.userSession.deleteMany({
            where: { userId },
        });
        // await cache.del(`user:${userId}`);
    }
    async forgotPassword(email) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            // Don't reveal if email exists
            return { message: 'If an account with this email exists, a reset code has been sent.' };
        }
        // Check rate limit - DISABLED
        // const otpAllowed = await checkOtpRateLimit(email);
        // if (!otpAllowed) {
        //   throw new AppError(429, 'Too many OTP requests. Please try again later.');
        // }
        const otp = this.generateOtp();
        // await setOtp(email, otp);
        await emailService.sendPasswordReset(email, otp);
        return { message: 'If an account with this email exists, a reset code has been sent.' };
    }
    async verifyResetOtp(email, otp) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        // const storedOtp = await getOtp(email);
        // if (!storedOtp) {
        //   throw new AppError(400, 'No reset request found');
        // }
        // if (storedOtp !== otp) {
        //   throw new AppError(400, 'Invalid OTP');
        // }
        // await deleteOtp(email);
        return { message: 'OTP verified successfully', userId: user.id };
    }
    async resetPassword(email, otp, newPassword) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        // const storedOtp = await getOtp(email);
        // if (!storedOtp) {
        //   throw new AppError(400, 'No reset request found');
        // }
        // if (storedOtp !== otp) {
        //   throw new AppError(400, 'Invalid OTP');
        // }
        const validation = validatePasswordStrength(newPassword);
        if (!validation.isValid) {
            throw new AppError(400, 'New password does not meet requirements', {
                errors: validation.errors,
            });
        }
        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(),
            },
        });
        // await deleteOtp(email);
        // Clear sessions
        await prisma.userSession.deleteMany({
            where: { userId: user.id },
        });
        // await cache.del(`user:${user.id}`);
        return { message: 'Password reset successfully' };
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendVerificationOtp(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        // Check rate limit - DISABLED
        // const otpAllowed = await checkOtpRateLimit(user.email);
        // if (!otpAllowed) {
        //   throw new AppError(429, 'Too many OTP requests. Please try again later.');
        // }
        const otp = this.generateOtp();
        // await setOtp(user.email, otp);
        await emailService.sendEmailVerification(user.email, otp);
    }
    async verifyEmail(userId, otp) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        // const storedOtp = await getOtp(user.email);
        // if (!storedOtp) {
        //   throw new AppError(400, 'No verification request found');
        // }
        // if (storedOtp !== otp) {
        //   throw new AppError(400, 'Invalid OTP');
        // }
        // Update user status to ACTIVE
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' },
        });
        // await deleteOtp(user.email);
        return { message: 'Email verified successfully' };
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map