import { prisma } from '../config/database.js';

export class PassageService {
  async list(where: any, skip: number, take: number) {
    return prisma.passage.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(where: any) {
    return prisma.passage.count({ where });
  }

  async getById(id: string) {
    return prisma.passage.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        },
        questions: {
          take: 5,
          include: {
            topic: true,
            _count: {
              select: { options: true }
            }
          }
        }
      }
    });
  }

  async create(data: { title?: string; content: string }, userId: string) {
    return prisma.passage.create({
      data,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async update(id: string, data: { title?: string; content?: string }, userId: string) {
    return prisma.passage.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Update questions to remove passage reference
      await tx.question.updateMany({
        where: { passageId: id },
        data: { passageId: null }
      });

      // Delete the passage
      return tx.passage.delete({
        where: { id }
      });
    });
  }

  async getQuestions(passageId: string, page: number, limit: number) {
    const where = { passageId };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          topic: true,
          options: {
            orderBy: { optionNumber: 'asc' }
          },
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              options: true,
              tags: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.question.count({ where })
    ]);

    return {
      data: questions,
      total,
      page,
      limit
    };
  }
}

export const passageService = new PassageService();
