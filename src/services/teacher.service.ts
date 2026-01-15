import { prisma } from '../config/database.js';

export class TeacherService {
  async list(where: any, orderBy: any, skip: number, take: number) {
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

  async count(where: any) {
    return prisma.user.count({ where });
  }

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
  }

  async create(data: any, userId: string) {
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

  async update(id: string, data: any, userId: string) {
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

  async softDelete(id: string, userId: string) {
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