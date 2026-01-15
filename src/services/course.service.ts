import { prisma } from '../config/database.js';

export class CourseService {
  async list(where: any, orderBy: any, skip: number, take: number) {
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

  async count(where: any) {
    return prisma.course.count({ where });
  }

  async getById(id: string) {
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

  async create(data: any, userId: string) {
    return prisma.course.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async update(id: string, data: any, userId: string) {
    return prisma.course.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });
  }

  async softDelete(id: string, userId: string) {
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