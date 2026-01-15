import { prisma } from '../config/database.js';
import { cache } from '../config/redis.js';
import { AppError } from '../middleware/errorHandler.js';
export class UserService {
    async getUserById(userId) {
        const cached = await cache.get(`user:${userId}`);
        if (cached) {
            return cached;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId, isDeleted: false, isActive: true },
            include: {
                profile: true,
                preferences: true,
            },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        await cache.set(`user:${userId}`, user, 3600);
        return user;
    }
    async getUserProfile(userId) {
        const user = await this.getUserById(userId);
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
            profile: user.profile,
            preferences: user.preferences,
        };
    }
    async updateProfile(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        const updateData = {};
        if (data.firstName !== undefined)
            updateData.firstName = data.firstName;
        if (data.lastName !== undefined)
            updateData.lastName = data.lastName;
        if (data.displayName !== undefined)
            updateData.displayName = data.displayName;
        if (data.dateOfBirth !== undefined)
            updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
        if (data.gender !== undefined)
            updateData.gender = data.gender;
        if (data.nationality !== undefined)
            updateData.nationality = data.nationality;
        if (data.religion !== undefined)
            updateData.religion = data.religion;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.primaryPhone !== undefined)
            updateData.primaryPhone = data.primaryPhone;
        if (data.secondaryPhone !== undefined)
            updateData.secondaryPhone = data.secondaryPhone;
        if (data.emergencyPhone !== undefined)
            updateData.emergencyPhone = data.emergencyPhone;
        if (data.currentStage !== undefined)
            updateData.currentStage = data.currentStage;
        if (data.currentClass !== undefined)
            updateData.currentClass = data.currentClass;
        if (data.academicYear !== undefined)
            updateData.academicYear = data.academicYear;
        if (data.rollNumber !== undefined)
            updateData.rollNumber = data.rollNumber;
        if (data.admissionNumber !== undefined)
            updateData.admissionNumber = data.admissionNumber;
        if (data.boardType !== undefined)
            updateData.boardType = data.boardType;
        if (data.schoolName !== undefined)
            updateData.schoolName = data.schoolName;
        if (data.avatar !== undefined)
            updateData.avatar = data.avatar;
        if (data.coverImage !== undefined)
            updateData.coverImage = data.coverImage;
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.interests !== undefined)
            updateData.interests = data.interests;
        if (data.languages !== undefined)
            updateData.languages = data.languages;
        const profile = await prisma.userProfile.update({
            where: { userId },
            data: updateData,
        });
        await cache.del(`user:${userId}`);
        return profile;
    }
    async updatePreferences(userId, data) {
        const preferences = await prisma.userPreferences.update({
            where: { userId },
            data: {
                theme: data.theme,
                language: data.language,
                timezone: data.timezone,
                dateFormat: data.dateFormat,
                emailNotifications: data.emailNotifications,
                smsNotifications: data.smsNotifications,
                pushNotifications: data.pushNotifications,
                examReminders: data.examReminders,
                performanceAlerts: data.performanceAlerts,
                profileVisibility: data.profileVisibility,
                showPerformanceRank: data.showPerformanceRank,
                shareDataForResearch: data.shareDataForResearch,
                studyReminderTime: data.studyReminderTime,
                weeklyStudyGoal: data.weeklyStudyGoal,
                preferredStudyMode: data.preferredStudyMode,
            },
        });
        await cache.del(`user:${userId}`);
        return preferences;
    }
    async addAddress(userId, data) {
        // If setting as primary, unset other primary addresses
        if (data.isPrimary) {
            await prisma.userAddress.updateMany({
                where: { userId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        const address = await prisma.userAddress.create({
            data: {
                userId,
                type: data.type || 'HOME',
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                country: data.country || 'India',
                pincode: data.pincode,
                landmark: data.landmark,
                isPrimary: data.isPrimary || false,
            },
        });
        await cache.del(`user:${userId}`);
        return address;
    }
    async updateAddress(userId, addressId, data) {
        const address = await prisma.userAddress.findUnique({
            where: { id: addressId },
        });
        if (!address || address.userId !== userId) {
            throw new AppError(404, 'Address not found');
        }
        // If setting as primary, unset other primary addresses
        if (data.isPrimary) {
            await prisma.userAddress.updateMany({
                where: { userId, isPrimary: true, id: { not: addressId } },
                data: { isPrimary: false },
            });
        }
        const updated = await prisma.userAddress.update({
            where: { id: addressId },
            data,
        });
        await cache.del(`user:${userId}`);
        return updated;
    }
    async deleteAddress(userId, addressId) {
        const address = await prisma.userAddress.findUnique({
            where: { id: addressId },
        });
        if (!address || address.userId !== userId) {
            throw new AppError(404, 'Address not found');
        }
        await prisma.userAddress.delete({
            where: { id: addressId },
        });
        await cache.del(`user:${userId}`);
    }
    async getAddresses(userId) {
        return prisma.userAddress.findMany({
            where: { userId },
        });
    }
    async uploadDocument(userId, data) {
        const document = await prisma.userDocument.create({
            data: {
                userId,
                type: data.type,
                title: data.title,
                description: data.description,
                fileName: data.fileName,
                filePath: data.filePath,
                fileSize: data.fileSize,
                mimeType: data.mimeType,
            },
        });
        return document;
    }
    async updateDocument(userId, documentId, data) {
        const document = await prisma.userDocument.findUnique({
            where: { id: documentId },
        });
        if (!document || document.userId !== userId) {
            throw new AppError(404, 'Document not found');
        }
        const updated = await prisma.userDocument.update({
            where: { id: documentId },
            data,
        });
        return updated;
    }
    async getDocuments(userId) {
        return prisma.userDocument.findMany({
            where: { userId },
        });
    }
    async deleteDocument(userId, documentId) {
        const document = await prisma.userDocument.findUnique({
            where: { id: documentId },
        });
        if (!document || document.userId !== userId) {
            throw new AppError(404, 'Document not found');
        }
        await prisma.userDocument.delete({
            where: { id: documentId },
        });
    }
}
export const userService = new UserService();
//# sourceMappingURL=user.service.js.map