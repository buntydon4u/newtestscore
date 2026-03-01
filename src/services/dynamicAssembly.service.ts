import { prisma } from '../config/database.js';
import { blueprintService } from './blueprint.service.js';
import { tagService } from './tag.service.js';
import { DifficultyLevel } from '@prisma/client';

export class DynamicAssemblyService {
  async generatePaper(
    examId: string,
    seed?: string,
    deliveryType: string = 'FULL',
    userId?: string
  ) {
    // Get exam details
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            examQuestions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    let paper: any = {
      examId,
      examTitle: exam.title,
      deliveryType,
      generatedAt: new Date(),
      seed: seed || this.generateSeed(),
      sections: []
    };

    switch (deliveryType) {
      case 'FULL':
        paper = await this.generateFullPaper(exam, seed);
        break;
      case 'SECTION_WISE':
        paper = await this.generateSectionWisePaper(exam, seed);
        break;
      case 'PRACTICE':
        paper = await this.generatePracticePaperFromExam(exam, seed);
        break;
      case 'ADAPTIVE':
        paper = await this.generateAdaptivePaper(exam, seed);
        break;
    }

    return paper;
  }

  async getGeneratedPaper(examId: string, userId?: string) {
    // In a real implementation, you'd store generated papers
    // For now, return the current exam structure
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { optionNumber: 'asc' }
                    },
                    topic: true,
                    tags: {
                      include: {
                        tag: true
                      }
                    }
                  }
                }
              },
              orderBy: { questionOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!exam) {
      return null;
    }

    return {
      examId,
      examTitle: exam.title,
      sections: exam.sections.map((section: any) => ({
        id: section.id,
        name: section.name,
        timeAllotted: section.timeAllotted,
        totalMarks: section.totalMarks,
        description: section.description,
        questions: section.examQuestions.map((eq: any) => ({
          ...eq.question,
          questionOrder: eq.questionOrder,
          marksOverride: eq.marksOverride
        }))
      }))
    };
  }

  async generateQuestionsForAttempt(
    attemptId: string,
    blueprintId: string,
    seed?: string,
    sectionId?: string,
    userId?: string
  ) {
    // Get blueprint and generate questions
    const blueprint = await blueprintService.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const paper = await blueprintService.generatePaper(blueprintId, seed);
    
    // If sectionId is provided, filter questions for that section
    if (sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId }
      });

      if (!section) {
        throw new Error('Section not found');
      }

      // Assign questions to the section
      await this.assignQuestionsToSection(sectionId, paper.questions);
    }

    return paper;
  }

  async getTaxonomy(type?: string) {
    const taxonomy: Record<string, any[]> = {};

    // Get subjects
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            topics: true
          }
        }
      }
    });

    taxonomy.subjects = subjects.map(s => ({
      id: s.id,
      name: s.name,
      count: s._count.topics
    }));

    // Get topics
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        subject: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      }
    });

    taxonomy.topics = topics.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject.name,
      count: t._count.questions
    }));

    // Get skills from tags
    const skills = await tagService.getTaxonomy('SKILL');
    taxonomy.skills = skills.SKILL || [];

    // Get difficulties
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    taxonomy.difficulties = difficulties.map(d => ({
      name: d,
      count: 0 // You would aggregate this from questions
    }));

    return taxonomy;
  }

  async validateBlueprint(blueprintId: string) {
    return await blueprintService.validate(blueprintId);
  }

  async previewQuestions(blueprintId: string, limit: number = 10, seed?: string) {
    return await blueprintService.preview(blueprintId, limit);
  }

  async generateAdaptiveQuestions(
    attemptId: string,
    sectionId: string,
    difficulty: string,
    performance: number,
    userId?: string
  ) {
    // Get section details
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        exam: true
      }
    });

    if (!section) {
      throw new Error('Section not found');
    }

    // Adjust difficulty based on performance
    let targetDifficulty = difficulty;
    if (performance < 50) {
      targetDifficulty = 'EASY';
    } else if (performance > 80) {
      targetDifficulty = 'HARD';
    }

    // Get questions of appropriate difficulty
    const questions = await prisma.question.findMany({
      where: {
        difficultyLevel: targetDifficulty as DifficultyLevel,
        topicId: {
          in: await this.getSectionTopics(sectionId)
        }
      },
      include: {
        options: {
          orderBy: { optionNumber: 'asc' }
        },
        topic: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      take: 5, // Generate 5 questions at a time
      orderBy: {
        createdAt: 'desc' // Using created date instead of random
      }
    });

    return {
      attemptId,
      sectionId,
      difficulty: targetDifficulty,
      questions,
      generatedAt: new Date()
    };
  }

  async getQuestionPool(examId: string, filters: {
    topicId?: string;
    difficulty?: string;
    questionType?: string;
    tags?: string[];
  }) {
    const where: any = {};

    // Get topics from exam sections
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            examQuestions: {
              select: {
                questionId: true
              }
            }
          }
        }
      }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    const questionIds = exam.sections.flatMap((s: any) => s.examQuestions.map((q: any) => q.questionId));

    if (filters.topicId) {
      where.topicId = filters.topicId;
    }

    if (filters.difficulty) {
      where.difficultyLevel = filters.difficulty as DifficultyLevel;
    }

    if (filters.questionType) {
      where.questionType = filters.questionType;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: filters.tags
            }
          }
        }
      };
    }

    where.id = {
      in: questionIds
    };

    const questions = await prisma.question.findMany({
      where,
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
            tags: true
          }
        }
      },
      take: 100
    });

    return {
      examId,
      filters,
      questions,
      total: questions.length
    };
  }

  async shuffleQuestions(examId: string, seed?: string, sectionId?: string, userId?: string) {
    const random = seed ? () => this.seededRandom(seed) : Math.random;

    if (sectionId) {
      // Shuffle questions in a specific section
      const questions = await prisma.examQuestion.findMany({
        where: { sectionId },
        include: {
          question: true
        }
      });

      const shuffled = this.shuffleArray(questions, random);
      
      // Update question orders
      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < shuffled.length; i++) {
          await tx.examQuestion.update({
            where: { id: shuffled[i].id },
            data: { questionOrder: i + 1 }
          });
        }
      });

      return { sectionId, shuffled: true };
    } else {
      // Shuffle all sections and their questions
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          sections: {
            include: {
              examQuestions: {
                include: {
                  question: true
                }
              }
            }
          }
        }
      });

      if (!exam) {
        throw new Error('Exam not found');
      }

      const shuffledSections = this.shuffleArray(exam.sections, random);

      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < shuffledSections.length; i++) {
          const sectionQuestions = this.shuffleArray(
            shuffledSections[i].examQuestions,
            random
          );

          for (let j = 0; j < sectionQuestions.length; j++) {
            await tx.examQuestion.update({
              where: { id: sectionQuestions[j].id },
              data: { questionOrder: j + 1 }
            });
          }
        }
      });

      return { examId, shuffled: true };
    }
  }

  async getDeliveryTypes() {
    return [
      {
        type: 'FULL',
        name: 'Complete Paper',
        description: 'Generate the complete paper with all sections'
      },
      {
        type: 'SECTION_WISE',
        name: 'Section by Section',
        description: 'Generate questions section by section'
      },
      {
        type: 'PRACTICE',
        name: 'Practice Mode',
        description: 'Generate practice questions with immediate feedback'
      },
      {
        type: 'ADAPTIVE',
        name: 'Adaptive Mode',
        description: 'AI-driven difficulty adjustment based on performance'
      }
    ];
  }

  async generateSectionWise(examId: string, sections: string[], seed?: string, userId?: string) {
    const result: any = {
      examId,
      sections: [],
      generatedAt: new Date(),
      seed: seed || this.generateSeed()
    };

    for (const sectionId of sections) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: {
          examQuestions: {
            include: {
              question: {
                include: {
                  options: {
                    orderBy: { optionNumber: 'asc' }
                  }
                }
              }
            },
            orderBy: { questionOrder: 'asc' }
          }
        }
      });

      if (section) {
        result.sections.push({
          sectionId,
          name: section.name,
          questions: section.examQuestions.map((eq: any) => ({
            ...eq.question,
            questionOrder: eq.questionOrder,
            marksOverride: eq.marksOverride
          }))
        });
      }
    }

    return result;
  }

  async generatePracticePaper(
    blueprintId: string,
    userId: string,
    difficulty?: string,
    topics?: string[],
    generatedBy?: string
  ) {
    const blueprint = await blueprintService.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    // Modify blueprint rules based on preferences
    const modifiedRules = blueprint.rules.map((rule: any) => {
      const newRule = { ...rule };
      
      if (difficulty) {
        // Adjust difficulty distribution
        newRule.difficultyDistribution = {
          [difficulty]: rule.questionCount
        };
      }

      if (topics && topics.length > 0 && !topics.includes(rule.topicId || '')) {
        // Skip this topic if not in preferred topics
        newRule.questionCount = 0;
      }

      return newRule;
    }).filter((rule: any) => rule.questionCount > 0);

    // Generate paper with modified rules
    return await blueprintService.generatePaper(blueprintId, this.generateSeed());
  }

  async analyzeQuestionDistribution(blueprintId: string) {
    const blueprint = await blueprintService.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const analysis: any = {
      totalQuestions: 0,
      byTopic: [],
      byDifficulty: {
        EASY: 0,
        MEDIUM: 0,
        HARD: 0
      },
      byType: {}
    };

    for (const rule of blueprint.rules) {
      analysis.totalQuestions += rule.questionCount;

      // Topic distribution
      if (rule.topicId) {
        analysis.byTopic.push({
          topicId: rule.topicId,
          questionCount: rule.questionCount
        });
      }

      // Difficulty distribution
      if (rule.difficultyDistribution) {
        const dist = rule.difficultyDistribution as any;
        Object.keys(dist).forEach(diff => {
          if (analysis.byDifficulty[diff as keyof typeof analysis.byDifficulty] !== undefined) {
            analysis.byDifficulty[diff as keyof typeof analysis.byDifficulty] += dist[diff];
          }
        });
      }
    }

    return analysis;
  }

  async optimizeBlueprint(blueprintId: string, constraints: any, userId?: string) {
    const blueprint = await blueprintService.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    // Simple optimization - balance difficulty distribution
    const optimizedRules = blueprint.rules.map((rule: any) => {
      const newRule = { ...rule };
      
      if (constraints.balanceDifficulty && !rule.difficultyDistribution) {
        // Distribute evenly across difficulties
        const perDifficulty = Math.floor(rule.questionCount / 3);
        newRule.difficultyDistribution = {
          EASY: perDifficulty,
          MEDIUM: perDifficulty,
          HARD: rule.questionCount - (perDifficulty * 2)
        };
      }

      return newRule;
    });

    // Update blueprint with optimized rules
    return await blueprintService.update(blueprintId, { rules: optimizedRules }, userId || '');
  }

  async validateQuestionPool(blueprintId: string) {
    const blueprint = await blueprintService.getById(blueprintId);
    
    if (!blueprint) {
      throw new Error('Blueprint not found');
    }

    const validation: any = {
      isValid: true,
      errors: [],
      warnings: [],
      availableQuestions: {}
    };

    for (const rule of blueprint.rules) {
      if (rule.topicId) {
        const available = await prisma.question.count({
          where: { topicId: rule.topicId }
        });

        validation.availableQuestions[rule.topicId] = available;

        if (available < rule.questionCount) {
          validation.isValid = false;
          validation.errors.push(
            `Topic has only ${available} questions, but requires ${rule.questionCount}`
          );
        }
      }
    }

    return validation;
  }

  async getSimilarQuestions(questionId: string, limit: number = 5) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topic: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const tagNames = question.tags.map((qt: any) => qt.tag.name);

    const similar = await prisma.question.findMany({
      where: {
        id: { not: questionId },
        topicId: question.topicId,
        questionType: question.questionType,
        difficultyLevel: question.difficultyLevel,
        tags: {
          some: {
            tag: {
              name: {
                in: tagNames
              }
            }
          }
        }
      },
      include: {
        topic: true,
        options: {
          orderBy: { optionNumber: 'asc' }
        },
        _count: {
          select: {
            tags: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return similar;
  }

  async generateQuestionVariations(
    questionId: string,
    count: number = 3,
    difficulty?: string,
    userId?: string
  ) {
    const original = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        topic: true,
        options: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!original) {
      throw new Error('Question not found');
    }

    // In a real implementation, you would use AI to generate variations
    // For now, return similar questions as variations
    const variations = await this.getSimilarQuestions(questionId, count);

    return {
      original,
      variations,
      generatedAt: new Date()
    };
  }

  // Helper methods
  private async generateFullPaper(exam: any, seed?: string) {
    // Implementation for generating full paper
    return {
      examId: exam.id,
      examTitle: exam.title,
      sections: exam.sections
    };
  }

  private async generateSectionWisePaper(exam: any, seed?: string) {
    // Implementation for section-wise generation
    return {
      examId: exam.id,
      examTitle: exam.title,
      sections: exam.sections
    };
  }

  private async generatePracticePaperFromExam(exam: any, seed?: string) {
    // Implementation for practice mode
    return {
      examId: exam.id,
      examTitle: exam.title,
      mode: 'PRACTICE',
      sections: exam.sections
    };
  }

  private async generateAdaptivePaper(exam: any, seed?: string) {
    // Implementation for adaptive mode
    return {
      examId: exam.id,
      examTitle: exam.title,
      mode: 'ADAPTIVE',
      sections: exam.sections
    };
  }

  private generateSeed(): string {
    return Date.now().toString();
  }

  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  }

  private shuffleArray<T>(array: T[], random: () => number): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async getSectionTopics(sectionId: string): Promise<string[]> {
    const questions = await prisma.examQuestion.findMany({
      where: { sectionId },
      include: {
        question: {
          select: {
            topicId: true
          }
        }
      }
    });

    return [...new Set(questions.map(q => q.question.topicId).filter(Boolean))];
  }

  private async assignQuestionsToSection(sectionId: string, questions: any[]) {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < questions.length; i++) {
        await tx.examQuestion.create({
          data: {
            sectionId,
            questionId: questions[i].id,
            questionOrder: i + 1
          }
        });
      }
    });
  }
}

export const dynamicAssemblyService = new DynamicAssemblyService();
