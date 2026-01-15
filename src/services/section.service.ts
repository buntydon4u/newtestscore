import { prisma } from '../config/database.js';

export class SectionService {
  async list(where: any, orderBy: any, skip: number, take: number) {
    return prisma.section.findMany({
      where,
      orderBy,
      skip,
      take,
    });
  }

  async count(where: any) {
    return prisma.section.count({ where });
  }

  async getById(id: string) {
    return prisma.section.findUnique({
      where: { id, isDeleted: false }
    });
  }

  async create(data: any, userId: string) {
    return prisma.section.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async update(id: string, data: any, userId: string) {
    return prisma.section.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
        updatedAt: new Date(),
      }
    });
  }

  async softDelete(id: string, userId: string) {
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