import { prisma } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class StudentService {
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
    const { profile, ...userData } = data;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user with profile
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        profile: profile ? {
          create: {
            ...profile,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
            isActive: profile.isActive !== undefined ? profile.isActive : true,
          },
        } : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        profile: true,
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    const { profile, ...userData } = data;
    
    return prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(profile && {
          profile: {
            update: {
              ...profile,
              dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            },
          },
        }),
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

export const studentService = new StudentService();