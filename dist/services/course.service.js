import { prisma } from '../config/database.js';
export class CourseService {
    async list(where, orderBy, skip, take) {
        return prisma.course.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                instructorId: true,
                isActive: true,
                isDeleted: true,
                deletedAt: true,
                deletedBy: true,
                createdAt: true,
                updatedAt: true,
                instructor: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
    }
    async count(where) {
        return prisma.course.count({ where });
    }
    async getById(id) {
        return prisma.course.findFirst({
            where: { id, isDeleted: false, isActive: true },
            select: {
                id: true,
                name: true,
                code: true,
                description: true,
                instructorId: true,
                isActive: true,
                isDeleted: true,
                deletedAt: true,
                deletedBy: true,
                createdAt: true,
                updatedAt: true,
                instructor: {
                    select: {
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });
    }
    async create(data, userId) {
        return prisma.course.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }
    async update(id, data, userId) {
        return prisma.course.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            }
        });
    }
    async softDelete(id, userId) {
        return prisma.course.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
            }
        });
    }
}
export const courseService = new CourseService();
//# sourceMappingURL=course.service.js.map