import { prisma } from '../config/database.js';

export class TagService {
  async list(where: any, skip: number, take: number) {
    return prisma.tag.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: { questionTags: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async count(where: any) {
    return prisma.tag.count({ where });
  }

  async getById(id: string) {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questionTags: true }
        },
        questionTags: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                difficultyLevel: true
              }
            }
          },
          take: 10
        }
      }
    });
  }

  async create(data: { name: string; category?: string }, userId: string) {
    return prisma.tag.create({
      data,
      include: {
        _count: {
          select: { questionTags: true }
        }
      }
    });
  }

  async update(id: string, data: { name?: string; category?: string }, userId: string) {
    return prisma.tag.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { questionTags: true }
        }
      }
    });
  }

  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete question tags first
      await tx.questionTag.deleteMany({
        where: { tagId: id }
      });

      // Delete the tag
      return tx.tag.delete({
        where: { id }
      });
    });
  }

  async tagQuestion(questionId: string, tagId: string, userId: string) {
    // Check if already tagged
    const existing = await prisma.questionTag.findUnique({
      where: {
        questionId_tagId: {
          questionId,
          tagId
        }
      }
    });

    if (existing) {
      throw new Error('Question already tagged with this tag');
    }

    return prisma.questionTag.create({
      data: {
        questionId,
        tagId
      },
      include: {
        tag: true,
        question: {
          select: {
            id: true,
            questionText: true
          }
        }
      }
    });
  }

  async untagQuestion(questionId: string, tagId: string, userId: string) {
    return prisma.questionTag.delete({
      where: {
        questionId_tagId: {
          questionId,
          tagId
        }
      }
    });
  }

  async getQuestionTags(questionId: string) {
    return prisma.questionTag.findMany({
      where: { questionId },
      include: {
        tag: true
      }
    });
  }

  async getPopularTags(limit: number = 20) {
    return prisma.tag.findMany({
      include: {
        _count: {
          select: { questionTags: true }
        }
      },
      orderBy: {
        questionTags: {
          _count: 'desc'
        }
      },
      take: limit
    });
  }

  async getTaxonomy(type?: string) {
    const where: any = {};
    
    if (type) {
      where.category = type;
    }

    const tags = await prisma.tag.findMany({
      where,
      select: {
        name: true,
        category: true,
        _count: {
          select: { questionTags: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by category
    const taxonomy: Record<string, any[]> = {};
    
    tags.forEach(tag => {
      const category = tag.category || 'Uncategorized';
      if (!taxonomy[category]) {
        taxonomy[category] = [];
      }
      taxonomy[category].push({
        name: tag.name,
        count: tag._count.questionTags
      });
    });

    return taxonomy;
  }

  async getByNames(names: string[]) {
    return prisma.tag.findMany({
      where: {
        name: {
          in: names
        }
      }
    });
  }

  async createMissingTags(names: string[]) {
    const existingTags = await this.getByNames(names);
    const existingNames = new Set(existingTags.map(t => t.name));
    const missingNames = names.filter(n => !existingNames.has(n));

    if (missingNames.length > 0) {
      const newTags = await prisma.tag.createMany({
        data: missingNames.map(name => ({ name })),
        skipDuplicates: true
      });

      return [...existingTags, ...await this.getByNames(missingNames)];
    }

    return existingTags;
  }
}

export const tagService = new TagService();
