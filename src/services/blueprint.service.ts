import { prisma } from '../config/database.js';

export class BlueprintService {
  async list(where: any, skip: number, take: number) {
    return prisma.examBlueprint.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: { rules: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async count(where: any) {
    return prisma.examBlueprint.count({ where });
  }

  async getById(id: string) {
    return prisma.examBlueprint.findUnique({
      where: { id },
      include: {
        rules: true,
        _count: {
          select: { rules: true }
        }
      }
    });
  }

  async create(data: {
    name: string;
    description?: string;
    classId?: string;
    rules?: Array<{
      topicId?: string;
      questionCount: number;
      difficultyDistribution?: any;
    }>;
  }, userId: string) {
    return prisma.$transaction(async (tx) => {
      const { rules, ...blueprintData } = data;

      const blueprint = await tx.examBlueprint.create({
        data: blueprintData,
        include: {
          rules: true
        }
      });

      // Create rules if provided
      if (rules && rules.length > 0) {
        await tx.blueprintRule.createMany({
          data: rules.map(rule => ({
            blueprintId: blueprint.id,
            topicId: rule.topicId,
            questionCount: rule.questionCount,
            difficultyDistribution: rule.difficultyDistribution || {}
          }))
        });
      }

      return await this.getById(blueprint.id);
    });
  }

  async update(id: string, data: any, userId: string) {
    return prisma.$transaction(async (tx) => {
      const { rules, ...blueprintData } = data;

      const blueprint = await tx.examBlueprint.update({
        where: { id },
        data: blueprintData
      });

      // Update rules if provided
      if (rules !== undefined) {
        // Delete existing rules
        await tx.blueprintRule.deleteMany({
          where: { blueprintId: id }
        });

        // Create new rules
        if (rules.length > 0) {
          await tx.blueprintRule.createMany({
            data: rules.map((rule: any) => ({
              blueprintId: id,
              topicId: rule.topicId,
              questionCount: rule.questionCount,
              difficultyDistribution: rule.difficultyDistribution || {}
            }))
          });
        }
      }

      return await this.getById(id);
    });
  }

  async delete(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete rules first
      await tx.blueprintRule.deleteMany({
        where: { blueprintId: id }
      });

      // Delete blueprint
      return tx.examBlueprint.delete({
        where: { id }
      });
    });
  }

  async addRule(blueprintId: string, data: {
    topicId?: string;
    questionCount: number;
    difficultyDistribution?: any;
  }, userId: string) {
    return prisma.blueprintRule.create({
      data: {
        blueprintId,
        ...data,
        difficultyDistribution: data.difficultyDistribution || {}
      }
    });
  }

  async getRuleById(ruleId: string) {
    return prisma.blueprintRule.findUnique({
      where: { id: ruleId },
      include: {
        blueprint: true
      }
    });
  }

  async updateRule(ruleId: string, data: {
    topicId?: string;
    questionCount?: number;
    difficultyDistribution?: any;
  }, userId: string) {
    return prisma.blueprintRule.update({
      where: { id: ruleId },
      data: {
        ...data,
        difficultyDistribution: data.difficultyDistribution || undefined
      }
    });
  }

  async deleteRule(ruleId: string, userId: string) {
    return prisma.blueprintRule.delete({
      where: { id: ruleId }
    });
  }

  async validate(blueprintId: string) {
    const blueprint = await this.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if blueprint has rules
    if (blueprint.rules.length === 0) {
      errors.push('Blueprint must have at least one rule');
    }

    // Check each rule
    for (const rule of blueprint.rules) {
      if (rule.questionCount <= 0) {
        errors.push(`Rule for topic ${rule.topicId || 'Unknown'} must have positive question count`);
      }

      // Check if topic has enough questions
      if (rule.topicId) {
        const availableQuestions = await prisma.question.count({
          where: { topicId: rule.topicId }
        });

        if (availableQuestions < rule.questionCount) {
          errors.push(`Topic ${rule.topicId || 'Unknown'} has only ${availableQuestions} questions, but requires ${rule.questionCount}`);
        }
      }

      // Validate difficulty distribution
      if (rule.difficultyDistribution) {
        const distribution = rule.difficultyDistribution as any;
        const total = Object.values(distribution).reduce((sum: number, val: any) => sum + val, 0);
        
        if (total !== rule.questionCount) {
          warnings.push(`Difficulty distribution total (${total}) doesn't match question count (${rule.questionCount})`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalQuestions: blueprint.rules.reduce((sum: number, rule) => sum + rule.questionCount, 0)
    };
  }

  async preview(blueprintId: string, limit: number = 10) {
    const blueprint = await this.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const questions: any[] = [];

    for (const rule of blueprint.rules) {
      const where: any = {};
      
      if (rule.topicId) {
        where.topicId = rule.topicId;
      }

      // Apply difficulty distribution if specified
      let orderBy: any = { createdAt: 'desc' };
      if (rule.difficultyDistribution) {
        // For simplicity, we'll just get random questions
        orderBy = { random: true } as any;
      }

      const ruleQuestions = await prisma.question.findMany({
        where,
        take: Math.min(rule.questionCount, limit),
        orderBy,
        include: {
          topic: true,
          options: {
            orderBy: { optionNumber: 'asc' }
          },
          _count: {
            select: { options: true }
          }
        }
      });

      questions.push(...ruleQuestions);

      if (questions.length >= limit) {
        break;
      }
    }

    return {
      blueprint: {
        id: blueprint.id,
        name: blueprint.name,
        description: blueprint.description
      },
      questions: questions.slice(0, limit),
      totalInBlueprint: blueprint.rules.reduce((sum: number, rule) => sum + rule.questionCount, 0)
    };
  }

  async clone(blueprintId: string, newName: string, userId: string) {
    const original = await this.getById(blueprintId);
    
    if (!original) {
      throw new Error('Blueprint not found');
    }

    return prisma.$transaction(async (tx) => {
      const newBlueprint = await tx.examBlueprint.create({
        data: {
          name: newName,
          description: original.description,
          classId: original.classId
        }
      });

      // Clone rules
      for (const rule of original.rules) {
        await tx.blueprintRule.create({
          data: {
            blueprintId: newBlueprint.id,
            topicId: rule.topicId,
            questionCount: rule.questionCount,
            difficultyDistribution: rule.difficultyDistribution ?? {}
          }
        });
      }

      return await this.getById(newBlueprint.id);
    });
  }

  async generatePaper(blueprintId: string, seed?: string) {
    const blueprint = await this.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const paper: any[] = [];
    
    // Use seed for reproducible randomization
    const random = seed ? this.seededRandom(seed) : Math.random;

    for (const rule of blueprint.rules) {
      const where: any = {};
      
      if (rule.topicId) {
        where.topicId = rule.topicId;
      }

      // Get all available questions for this rule
      const availableQuestions = await prisma.question.findMany({
        where,
        include: {
          topic: true,
          options: {
            orderBy: { optionNumber: 'asc' }
          },
          passage: true,
          mediaAsset: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      // Shuffle questions
      const shuffled = this.shuffleArray(availableQuestions, random);
      
      // Select required number of questions
      const selected = shuffled.slice(0, rule.questionCount);
      
      // Add to paper with order
      selected.forEach((question, index) => {
        paper.push({
          ...question,
          sectionOrder: paper.length + 1,
          ruleId: rule.id
        });
      });
    }

    return {
      blueprintId,
      blueprintName: blueprint.name,
      generatedAt: new Date(),
      seed,
      totalQuestions: paper.length,
      questions: paper
    };
  }

  private seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }

    let state = Math.abs(hash) % 233280;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  private shuffleArray<T>(array: T[], random: () => number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const blueprintService = new BlueprintService();
