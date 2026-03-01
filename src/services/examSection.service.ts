import { prisma } from '../config/database.js';

export class ExamSectionService {
  async createSection(examId: string, data: {
    name: string;
    description?: string;
    timeAllotted?: number;
    duration?: number;
    totalMarks?: number;
    sectionNumber?: number;
  }, userId: string) {
    const existingCount = await prisma.section.count({ where: { examId } });
    const sectionNumber = data.sectionNumber ?? existingCount + 1;
    const timeAllotted = data.timeAllotted ?? data.duration ?? 0;
    const totalMarks = data.totalMarks ?? 0;

    return prisma.section.create({
      data: {
        examId,
        sectionNumber,
        name: data.name,
        description: data.description,
        timeAllotted,
        totalMarks
      },
      include: {
        _count: {
          select: { examQuestions: true }
        }
      }
    });
  }

  async getSectionById(sectionId: string) {
    return prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        exam: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: { examQuestions: true }
        }
      }
    });
  }

  async updateSection(sectionId: string, data: any, userId: string) {
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.sectionNumber !== undefined) updateData.sectionNumber = data.sectionNumber;
    if (data.timeAllotted !== undefined) updateData.timeAllotted = data.timeAllotted;
    if (data.totalMarks !== undefined) updateData.totalMarks = data.totalMarks;

    return prisma.section.update({
      where: { id: sectionId },
      data: updateData,
      include: {
        _count: {
          select: { examQuestions: true }
        }
      }
    });
  }

  async deleteSection(sectionId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Delete exam questions
      await tx.examQuestion.deleteMany({
        where: { sectionId }
      });

      // Delete section
      return tx.section.delete({
        where: { id: sectionId }
      });
    });
  }

  async assignQuestions(sectionId: string, questions: Array<{
    questionId: string;
    questionOrder?: number;
    marksOverride?: number;
  }>, userId: string) {
    return prisma.$transaction(async (tx) => {
      const assigned = [];

      for (const q of questions) {
        // Check if already assigned
        const existing = await tx.examQuestion.findFirst({
          where: {
            questionId: q.questionId,
            sectionId
          }
        });

        if (existing) {
          // Update existing
          const updated = await tx.examQuestion.update({
            where: { id: existing.id },
            data: {
              questionOrder: q.questionOrder || existing.questionOrder,
              marksOverride: q.marksOverride
            }
          });
          assigned.push(updated);
        } else {
          // Create new assignment
          const created = await tx.examQuestion.create({
            data: {
              sectionId,
              questionId: q.questionId,
              questionOrder: q.questionOrder || 0,
              marksOverride: q.marksOverride
            },
            include: {
              question: {
                select: {
                  id: true,
                  questionText: true,
                  questionType: true,
                  marks: true
                }
              }
            }
          });
          assigned.push(created);
        }
      }

      return assigned;
    });
  }

  async getQuestionAssignment(questionId: string, sectionId: string) {
    return prisma.examQuestion.findFirst({
      where: {
        questionId,
        sectionId
      },
      include: {
        question: true,
        section: true
      }
    });
  }

  async updateQuestionAssignment(
    questionId: string,
    sectionId: string,
    data: {
      questionOrder?: number;
      marksOverride?: number;
    },
    userId: string
  ) {
    const existing = await prisma.examQuestion.findFirst({
      where: {
        questionId,
        sectionId
      }
    });

    if (!existing) {
      return null;
    }

    return prisma.examQuestion.update({
      where: { id: existing.id },
      data
    });
  }

  async removeQuestion(questionId: string, sectionId: string, userId: string) {
    return prisma.examQuestion.deleteMany({
      where: {
        questionId,
        sectionId
      }
    });
  }

  async getSectionQuestions(sectionId: string, page: number, limit: number) {
    const where = { sectionId };

    const [questions, total] = await Promise.all([
      prisma.examQuestion.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          question: {
            include: {
              topic: {
                select: {
                  id: true,
                  name: true,
                  subjectId: true
                }
              },
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
          }
        },
        orderBy: { questionOrder: 'asc' }
      }),
      prisma.examQuestion.count({ where })
    ]);

    return {
      data: questions,
      total,
      page,
      limit
    };
  }

  async reorderQuestions(sectionId: string, questionOrders: Array<{
    questionId: string;
    questionOrder: number;
  }>, userId: string) {
    return prisma.$transaction(async (tx) => {
      for (const item of questionOrders) {
        await tx.examQuestion.updateMany({
          where: {
            questionId: item.questionId,
            sectionId
          },
          data: {
            questionOrder: item.questionOrder
          }
        });
      }
    });
  }

  async getExamStructure(examId: string) {
    const sections = await prisma.section.findMany({
      where: { examId },
      include: {
        _count: {
          select: { examQuestions: true }
        },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                marks: true,
                negativeMarks: true,
                difficultyLevel: true,
                correctAnswer: true,
                options: {
                  select: {
                    id: true,
                    optionNumber: true,
                    optionText: true,
                    isCorrect: true
                  },
                  orderBy: { optionNumber: 'asc' }
                }
              }
            }
          },
          orderBy: { questionOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate totals
    const totalQuestions = sections.reduce((sum, s) => sum + s._count.examQuestions, 0);
    const totalMarks = sections.reduce((sum, se) => {
      return sum + se.examQuestions.reduce((s2, eq) => {
        return s2 + (eq.marksOverride || eq.question.marks);
      }, 0);
    }, 0);

    return {
      examId,
      sections,
      summary: {
        totalSections: sections.length,
        totalQuestions,
        totalMarks
      }
    };
  }

  async duplicateSection(sectionId: string, newName: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const original = await tx.section.findUnique({
        where: { id: sectionId },
        include: {
          examQuestions: {
            include: {
              question: true
            }
          }
        }
      });

      if (!original) {
        throw new Error('Section not found');
      }

      // Create new section
      const newSection = await tx.section.create({
        data: {
          examId: original.examId,
          sectionNumber: original.sectionNumber,
          name: newName,
          description: original.description,
          timeAllotted: original.timeAllotted,
          totalMarks: original.totalMarks
        }
      });

      // Copy questions
      for (const eq of original.examQuestions) {
        await tx.examQuestion.create({
          data: {
            sectionId: newSection.id,
            questionId: eq.questionId,
            questionOrder: eq.questionOrder,
            marksOverride: eq.marksOverride
          }
        });
      }

      return await this.getSectionById(newSection.id);
    });
  }
}

export const examSectionService = new ExamSectionService();
