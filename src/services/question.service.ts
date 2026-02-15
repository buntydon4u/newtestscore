import { prisma } from '../config/database.js';
import { QuestionType, DifficultyLevel } from '@prisma/client';

export class QuestionService {
  async list(where: any, skip: number, take: number) {
    return prisma.question.findMany({
      where,
      skip,
      take,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            subjectId: true
          }
        },
        bank: true,
        options: {
          orderBy: { optionNumber: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        passage: true,
        mediaAsset: true,
        _count: {
          select: {
            options: true,
            tags: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(where: any) {
    return prisma.question.count({ where });
  }

  async getById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            subjectId: true
          }
        },
        bank: true,
        options: {
          orderBy: { optionNumber: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        passage: true,
        mediaAsset: true,
        _count: {
          select: {
            options: true,
            tags: true
          }
        }
      }
    });
  }

  async create(data: {
    questionBankId: string;
    topicId: string;
    questionType: QuestionType;
    questionText: string;
    correctAnswer?: any;
    marks: number;
    negativeMarks?: number;
    difficultyLevel?: DifficultyLevel;
    passageId?: string;
    mediaAssetId?: string;
    options?: Array<{
      optionNumber: number;
      optionText: string;
      isCorrect: boolean;
    }>;
    tags?: string[];
  }, userId: string) {
    return prisma.$transaction(async (tx) => {
      const { options, tags, ...questionData } = data;

      const question = await tx.question.create({
        data: {
          ...questionData,
          difficultyLevel: questionData.difficultyLevel || DifficultyLevel.MEDIUM,
          negativeMarks: questionData.negativeMarks || 0,
        }
      });

      // Create options if provided
      if (options && options.length > 0) {
        await tx.questionOption.createMany({
          data: options.map(opt => ({
            questionId: question.id,
            optionNumber: opt.optionNumber,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect
          }))
        });
      }

      // Create tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          let tag = await tx.tag.findUnique({
            where: { name: tagName }
          });

          if (!tag) {
            tag = await tx.tag.create({
              data: { name: tagName }
            });
          }

          await tx.questionTag.create({
            data: {
              questionId: question.id,
              tagId: tag.id
            }
          });
        }
      }

      return await tx.question.findUnique({
        where: { id: question.id },
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              subjectId: true
            }
          },
          bank: true,
          options: {
            orderBy: { optionNumber: 'asc' }
          },
          tags: {
            include: {
              tag: true
            }
          },
          passage: true,
          mediaAsset: true,
          _count: {
            select: {
              options: true,
              tags: true
            }
          }
        }
      });
    });
  }

  async update(id: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const { options, tags, ...questionData } = data;

      const question = await tx.question.update({
        where: { id },
        data: {
          ...questionData,
          updatedAt: new Date()
        }
      });

      // Update options if provided
      if (options) {
        // Delete existing options
        await tx.questionOption.deleteMany({
          where: { questionId: id }
        });

        // Create new options
        if (options.length > 0) {
          await tx.questionOption.createMany({
            data: options.map((opt: any) => ({
              questionId: id,
              optionNumber: opt.optionNumber,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect
            }))
          }
          );
        }
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Delete existing tags
        await tx.questionTag.deleteMany({
          where: { questionId: id }
        });

        // Create new tags
        if (tags.length > 0) {
          for (const tagName of tags) {
            let tag = await tx.tag.findUnique({
              where: { name: tagName }
            });

            if (!tag) {
              tag = await tx.tag.create({
                data: { name: tagName }
              });
            }

            await tx.questionTag.create({
              data: {
                questionId: id,
                tagId: tag.id
              }
            });
          }
        }
      }

      return await tx.question.findUnique({
        where: { id },
        include: {
          topic: {
            select: {
              id: true,
              name: true,
              subjectId: true
            }
          },
          bank: true,
          options: {
            orderBy: { optionNumber: 'asc' }
          },
          tags: {
            include: {
              tag: true
            }
          },
          passage: true,
          mediaAsset: true,
          _count: {
            select: {
              options: true,
              tags: true
            }
          }
        }
      });
    });
  }

  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.questionTag.deleteMany({
        where: { questionId: id }
      });

      await tx.questionOption.deleteMany({
        where: { questionId: id }
      });

      await tx.question.delete({
        where: { id }
      });
    });
  }

  async addOption(questionId: string, data: {
    optionNumber: number;
    optionText: string;
    isCorrect: boolean;
  }, userId: string) {
    return prisma.questionOption.create({
      data: {
        questionId,
        ...data
      }
    });
  }

  async updateOption(optionId: string, data: {
    optionNumber?: number;
    optionText?: string;
    isCorrect?: boolean;
  }, userId: string) {
    return prisma.questionOption.update({
      where: { id: optionId },
      data
    });
  }

  async deleteOption(optionId: string, userId: string) {
    return prisma.questionOption.delete({
      where: { id: optionId }
    });
  }

  async bulkCreate(questions: any[], userId: string) {
    return prisma.$transaction(async (tx) => {
      const createdQuestions = [];

      for (const questionData of questions) {
        const { options, tags, ...qData } = questionData;

        const question = await tx.question.create({
          data: {
            ...qData,
            difficultyLevel: qData.difficultyLevel || DifficultyLevel.MEDIUM,
            negativeMarks: qData.negativeMarks || 0,
          }
        });

        // Create options
        if (options && options.length > 0) {
          await tx.questionOption.createMany({
            data: options.map((opt: any) => ({
              questionId: question.id,
              optionNumber: opt.optionNumber,
              optionText: opt.optionText,
              isCorrect: opt.isCorrect
            }))
          });
        }

        // Create tags
        if (tags && tags.length > 0) {
          for (const tagName of tags) {
            let tag = await tx.tag.findUnique({
              where: { name: tagName }
            });

            if (!tag) {
              tag = await tx.tag.create({
                data: { name: tagName }
              });
            }

            await tx.questionTag.create({
              data: {
                questionId: question.id,
                tagId: tag.id
              }
            });
          }
        }

        createdQuestions.push(await this.getById(question.id));
      }

      return createdQuestions;
    });
  }
}

export const questionService = new QuestionService();
