import { prisma } from '../config/database.js';

export class QuestionBankService {
  async list(where: any, skip: number, take: number) {
    return prisma.questionBank.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async count(where: any) {
    return prisma.questionBank.count({ where });
  }

  async getById(id: string) {
    return prisma.questionBank.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async create(data: { name: string; description?: string; boardId?: string }, userId: string) {
    return prisma.questionBank.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; description?: string; boardId?: string }, userId: string) {
    return prisma.questionBank.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    return prisma.questionBank.delete({
      where: { id }
    });
  }

  async getQuestions(bankId: string, filters: {
    page: number;
    limit: number;
    questionType?: string;
    difficultyLevel?: string;
    topicId?: string;
  }) {
    const where: any = { questionBankId: bankId };

    if (filters.questionType) {
      where.questionType = filters.questionType;
    }

    if (filters.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel;
    }

    if (filters.topicId) {
      where.topicId = filters.topicId;
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              subjectId: true
            }
          },
          options: true,
          tags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: {
              options: true
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
      page: filters.page,
      limit: filters.limit
    };
  }
}

export const questionBankService = new QuestionBankService();
