import { prisma } from '../config/database.js';

export class TopicService {
  async list(where: any, orderBy: any, skip: number, take: number) {
    return prisma.topic.findMany({
      where,
      orderBy,
      skip,
      take,
    });
  }

  async count(where: any) {
    return prisma.topic.count({ where });
  }

  async getById(id: string) {
    return prisma.topic.findUnique({
      where: { id, isDeleted: false }
    });
  }

  async create(data: any, userId: string) {
    return prisma.topic.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async update(id: string, data: any, userId: string) {
    return prisma.topic.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  async softDelete(id: string, userId: string) {
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