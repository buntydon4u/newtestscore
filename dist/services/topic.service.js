import { prisma } from '../config/database.js';
export class TopicService {
    async list(where, orderBy, skip, take) {
        return prisma.topic.findMany({
            where,
            orderBy,
            skip,
            take,
        });
    }
    async count(where) {
        return prisma.topic.count({ where });
    }
    async getById(id) {
        return prisma.topic.findUnique({
            where: { id, isDeleted: false }
        });
    }
    async create(data, userId) {
        return prisma.topic.create({
            data: {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
    }
    async update(id, data, userId) {
        return prisma.topic.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            }
        });
    }
    async softDelete(id, userId) {
        return prisma.topic.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId,
            }
        });
    }
}
export const topicService = new TopicService();
//# sourceMappingURL=topic.service.js.map