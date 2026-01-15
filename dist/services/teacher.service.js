import { prisma } from '../config/database.js';
export class TeacherService {
    async list(where, orderBy, skip, take) {
        return prisma.user.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                profile: true,
            },
        });
    }
    async count(where) {
        return prisma.user.count({ where });
    }
    async getById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                profile: true,
            },
        });
    }
    async create(data, userId) {
        return prisma.user.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            include: {
                profile: true,
            },
        });
    }
    async update(id, data, userId) {
        return prisma.user.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: {
                profile: true,
            },
        });
    }
    async softDelete(id, userId) {
        return prisma.user.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
            },
        });
    }
}
export const teacherService = new TeacherService();
//# sourceMappingURL=teacher.service.js.map