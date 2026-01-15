import { prisma } from '../config/database.js';
export class SectionService {
    async list(where, orderBy, skip, take) {
        return prisma.section.findMany({
            where,
            orderBy,
            skip,
            take,
        });
    }
    async count(where) {
        return prisma.section.count({ where });
    }
    async getById(id) {
        return prisma.section.findUnique({
            where: { id, isDeleted: false }
        });
    }
    async create(data, userId) {
        return prisma.section.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }
    async update(id, data, userId) {
        return prisma.section.update({
            where: { id },
            data: {
                ...data,
                updatedBy: userId,
                updatedAt: new Date(),
            }
        });
    }
    async softDelete(id, userId) {
        return prisma.section.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
            }
        });
    }
}
export const sectionService = new SectionService();
//# sourceMappingURL=section.service.js.map