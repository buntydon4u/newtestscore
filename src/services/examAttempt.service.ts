import { prisma } from '../config/database.js';
import { AttemptStatus } from '@prisma/client';
import { scoringService } from './scoring.service.js';

export class ExamAttemptService {
  async startAttempt(examId: string, scheduleId?: string, userId?: string) {
    // Check if user has an active attempt
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        userId: userId!,
        examId,
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS']
        }
      }
    });

    if (existingAttempt) {
      throw new Error('You already have an active attempt for this exam');
    }

    // Get exam details
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        sections: {
          include: {
            _count: {
              select: { examQuestions: true }
            }
          }
        }
      }
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    return prisma.$transaction(async (tx) => {
      // Create main attempt
      const attempt = await tx.examAttempt.create({
        data: {
          userId: userId!,
          examId,
          status: AttemptStatus.NOT_STARTED,
          remainingTime: exam.duration * 60, // Convert minutes to seconds
          ipAddress: '127.0.0.1', // Should come from request
          userAgent: 'Test Agent' // Should come from request
        }
      });

      // Create section attempts
      for (const section of exam.sections) {
        await tx.sectionAttempt.create({
          data: {
            attemptId: attempt.id,
            sectionId: section.id,
            status: AttemptStatus.NOT_STARTED
          }
        });
      }

      return await this.getAttempt(attempt.id, userId);
    });
  }

  async getAttempt(attemptId: string, userId?: string) {
    const where: any = { id: attemptId };
    if (userId) {
      where.userId = userId;
    }

    return prisma.examAttempt.findUnique({
      where,
      include: {
        exam: {
          include: {
            sections: true
          }
        },
        sectionAttempts: {
          include: {
            section: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                marks: true,
                options: {
                  orderBy: { optionNumber: 'asc' }
                }
              }
            }
          }
        },
        scores: true,
        _count: {
          select: {
            answers: true,
            sectionAttempts: true
          }
        }
      }
    });
  }

  async resumeAttempt(attemptId: string, userId: string) {
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      }
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.status === AttemptStatus.SUBMITTED || attempt.status === AttemptStatus.AUTO_SUBMITTED) {
      throw new Error('Attempt already submitted');
    }

    // If already in progress, return as-is
    if (attempt.status === AttemptStatus.IN_PROGRESS) {
      return prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
          exam: {
            include: {
              sections: true
            }
          },
          sectionAttempts: {
            include: {
              section: true
            }
          }
        }
      });
    }

    // Check if time is expired
    if (attempt.remainingTime && attempt.remainingTime <= 0) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: AttemptStatus.AUTO_SUBMITTED }
      });
      throw new Error('Exam time has expired');
    }

    return prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.IN_PROGRESS,
        updatedAt: new Date()
      },
      include: {
        exam: {
          include: {
            sections: true
          }
        },
        sectionAttempts: {
          include: {
            section: true
          }
        }
      }
    });
  }

  async submitAttempt(attemptId: string, answers: any[], userId: string) {
    const attempt = await prisma.$transaction(async (tx) => {
      // Save all answers
      for (const answer of answers) {
        const existing = await tx.questionAnswer.findFirst({
          where: {
            attemptId,
            questionId: answer.questionId
          }
        });

        if (existing) {
          await tx.questionAnswer.update({
            where: { id: existing.id },
            data: {
              userAnswer: answer.userAnswer,
              timeTaken: answer.timeTaken
            }
          });
        } else {
          await tx.questionAnswer.create({
            data: {
              attemptId,
              questionId: answer.questionId,
              userAnswer: answer.userAnswer,
              timeTaken: answer.timeTaken
            }
          });
        }
      }

      // Update attempt status
      const attempt = await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: AttemptStatus.SUBMITTED,
          updatedAt: new Date()
        },
        include: {
          sectionAttempts: true
        }
      });

      // Update all section attempts to submitted
      await tx.sectionAttempt.updateMany({
        where: {
          attemptId,
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS']
          }
        },
        data: {
          status: AttemptStatus.SUBMITTED
        }
      });

      return attempt;
    });

    // Auto-evaluate after submit to generate score (objective questions scored, descriptive left null)
    try {
      await scoringService.evaluateAttempt(attemptId);
    } catch (error) {
      console.error('Auto evaluation failed:', error);
    }

    return attempt;
  }

  async getAttemptSections(attemptId: string, userId?: string) {
    const attempt = await this.getAttempt(attemptId, userId);
    
    if (!attempt) {
      throw new Error('Attempt not found');
    }

    return prisma.sectionAttempt.findMany({
      where: { attemptId },
      include: {
        section: {
          include: {
            examQuestions: {
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    questionType: true,
                    marks: true
                  }
                }
              },
              orderBy: { questionOrder: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async startSection(attemptId: string, sectionId: string, userId: string) {
    // Verify attempt belongs to user
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      }
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const existing = await prisma.sectionAttempt.findFirst({
      where: {
        attemptId,
        sectionId
      }
    });

    if (!existing) {
      throw new Error('Section attempt not found');
    }

    return prisma.sectionAttempt.update({
      where: { id: existing.id },
      data: {
        status: AttemptStatus.IN_PROGRESS,
        updatedAt: new Date()
      },
      include: {
        section: true
      }
    });
  }

  async submitSection(attemptId: string, sectionId: string, userId: string) {
    // Verify attempt belongs to user
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      }
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    const existing = await prisma.sectionAttempt.findFirst({
      where: {
        attemptId,
        sectionId
      }
    });

    if (!existing) {
      throw new Error('Section attempt not found');
    }

    return prisma.sectionAttempt.update({
      where: { id: existing.id },
      data: {
        status: AttemptStatus.SUBMITTED,
        updatedAt: new Date()
      },
      include: {
        section: true
      }
    });
  }

  async getAttemptQuestions(attemptId: string, sectionId?: string, userId?: string) {
    const where: any = { attemptId };
    
    if (userId) {
      const attempt = await prisma.examAttempt.findFirst({
        where: { id: attemptId, userId }
      });
      if (!attempt) {
        throw new Error('Attempt not found');
      }
    }

    const examQuestions = await prisma.examQuestion.findMany({
      where: {
        section: {
          examId: (await prisma.examAttempt.findUnique({ where: { id: attemptId } }))?.examId
        },
        ...(sectionId && { sectionId })
      },
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
            mediaAsset: true
          }
        },
        section: {
          select: {
            id: true,
            name: true,
            timeAllotted: true,
            totalMarks: true
          }
        }
      },
      orderBy: { questionOrder: 'asc' }
    });

    // Get user's answers if they exist
    const answers = await prisma.questionAnswer.findMany({
      where: { attemptId },
      select: {
        questionId: true,
        userAnswer: true,
        isCorrect: true,
        marksAwarded: true
      }
    });

    const answerMap = new Map(
      answers.map(a => [a.questionId, a])
    );

    // Merge questions with answers
    return examQuestions.map(eq => ({
      ...eq.question,
      section: eq.section,
      questionOrder: eq.questionOrder,
      marksOverride: eq.marksOverride,
      userAnswer: answerMap.get(eq.questionId)?.userAnswer,
      isCorrect: answerMap.get(eq.questionId)?.isCorrect,
      marksAwarded: answerMap.get(eq.questionId)?.marksAwarded
    }));
  }

  async saveAnswer(attemptId: string, questionId: string, userAnswer: any, timeTaken?: number, userId?: string) {
    // Verify attempt belongs to user
    if (userId) {
      const attempt = await prisma.examAttempt.findFirst({
        where: {
          id: attemptId,
          userId,
          status: {
            in: ['NOT_STARTED', 'IN_PROGRESS']
          }
        }
      });

      if (!attempt) {
        throw new Error('Attempt not found or not active');
      }
    }

    const existing = await prisma.questionAnswer.findFirst({
      where: {
        attemptId,
        questionId
      }
    });

    if (existing) {
      return prisma.questionAnswer.update({
        where: { id: existing.id },
        data: {
          userAnswer,
          timeTaken,
          updatedAt: new Date()
        }
      });
    }

    return prisma.questionAnswer.create({
      data: {
        attemptId,
        questionId,
        userAnswer,
        timeTaken
      }
    });
  }

  async getAnswers(attemptId: string, sectionId?: string, userId?: string) {
    const where: any = { attemptId };
    
    if (userId) {
      const attempt = await prisma.examAttempt.findFirst({
        where: { id: attemptId, userId }
      });
      if (!attempt) {
        throw new Error('Attempt not found');
      }
    }

    return prisma.questionAnswer.findMany({
      where,
      include: {
        question: {
          include: {
            options: {
              orderBy: { optionNumber: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async submitAllAnswers(attemptId: string, answers: any[], userId: string) {
    return this.submitAttempt(attemptId, answers, userId);
  }

  async getRemainingTime(attemptId: string, userId?: string) {
    const where: any = { id: attemptId };
    if (userId) {
      where.userId = userId;
    }

    const attempt = await prisma.examAttempt.findUnique({
      where
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    return {
      remainingTime: attempt.remainingTime,
      timeSpent: attempt.timeSpent,
      status: attempt.status
    };
  }

  async getStatus(attemptId: string, userId?: string) {
    const where: any = { id: attemptId };
    if (userId) {
      where.userId = userId;
    }

    const attempt = await prisma.examAttempt.findUnique({
      where,
      select: {
        id: true,
        status: true,
        remainingTime: true,
        timeSpent: true,
        updatedAt: true
      }
    });

    if (!attempt) {
      return null;
    }

    return attempt;
  }

  async updateTime(attemptId: string, timeSpent: number, userId: string) {
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.IN_PROGRESS
      }
    });

    if (!attempt) {
      throw new Error('Active attempt not found');
    }

    const newTimeSpent = attempt.timeSpent + timeSpent;
    const newRemainingTime = Math.max(0, (attempt.remainingTime || 0) - timeSpent);

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        timeSpent: newTimeSpent,
        remainingTime: newRemainingTime,
        updatedAt: new Date()
      }
    });

    // Check if time expired
    if (newRemainingTime <= 0) {
      await prisma.examAttempt.update({
        where: { id: attemptId },
        data: { status: AttemptStatus.AUTO_SUBMITTED }
      });
    }
  }

  async pauseAttempt(attemptId: string, userId: string) {
    const attempt = await prisma.examAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: AttemptStatus.IN_PROGRESS
      }
    });

    if (!attempt) {
      throw new Error('Active attempt not found');
    }

    return prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.PAUSED,
        updatedAt: new Date()
      }
    });
  }

  async getUserAttempts(userId: string, filters: {
    page: number;
    limit: number;
    status?: string;
    examId?: string;
  }) {
    const where: any = { userId };
    
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.examId) {
      where.examId = filters.examId;
    }

    const [attempts, total] = await Promise.all([
      prisma.examAttempt.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              duration: true,
              totalMarks: true
            }
          },
          scores: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              answers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.examAttempt.count({ where })
    ]);

    return {
      data: attempts,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getExamResults(examId: string, page: number, limit: number) {
    const where = { examId };

    const [attempts, total] = await Promise.all([
      prisma.examAttempt.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true
            }
          },
          scores: true,
          _count: {
            select: {
              answers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.examAttempt.count({ where })
    ]);

    return {
      data: attempts,
      total,
      page,
      limit
    };
  }
}

export const examAttemptService = new ExamAttemptService();
