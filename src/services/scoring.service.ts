import { prisma } from '../config/database.js';
import { PerformanceStatus, QuestionType } from '@prisma/client';

export class ScoringService {
  async evaluateAttempt(attemptId: string, manualGrading?: any[], userId?: string) {
    return prisma.$transaction(async (tx) => {
      // Get attempt with answers and questions
      const attempt = await tx.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: true
                }
              }
            }
          },
          exam: true,
          sectionAttempts: {
            include: {
              section: {
                include: {
                  examQuestions: {
                    include: {
                      question: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!attempt) {
        throw new Error('Attempt not found');
      }

      let totalMarks = 0;
      let marksSecured = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      // Evaluate each answer
      for (const answer of attempt.answers) {
        const question = answer.question;
        let isCorrect: boolean | null = false;
        let marksAwarded = 0;

        if (!answer.userAnswer || answer.userAnswer === null) {
          unansweredCount++;
        } else {
          // Auto-evaluate based on question type
          const evaluation = this.evaluateAnswer(question, answer.userAnswer);
          isCorrect = evaluation.isCorrect;
          marksAwarded = evaluation.marks;

          // Apply manual grading if provided
          if (manualGrading) {
            const manual = manualGrading.find((m: any) => m.questionId === question.id);
            if (manual) {
              isCorrect = manual.isCorrect !== undefined ? manual.isCorrect : isCorrect;
              marksAwarded = manual.marksAwarded !== undefined ? manual.marksAwarded : marksAwarded;
            }
          }

          if (isCorrect === true) {
            correctCount++;
          } else if (isCorrect === false) {
            wrongCount++;
          }
        }

        totalMarks += question.marks;
        marksSecured += marksAwarded;

        // Update answer with evaluation
        await tx.questionAnswer.update({
          where: { id: answer.id },
          data: {
            isCorrect,
            marksAwarded
          }
        });
      }

      // Calculate percentage and grade
      const percentage = totalMarks > 0 ? (marksSecured / totalMarks) * 100 : 0;
      const grade = this.calculateGrade(percentage);

      // Create or update user score
      const existingScore = await tx.userScore.findFirst({
        where: {
          attemptId,
          userId: attempt.userId
        }
      });

      const userScore = existingScore
        ? await tx.userScore.update({
            where: { id: existingScore.id },
            data: {
              totalMarks,
              marksSecured,
              percentage,
              grade,
              correctCount,
              wrongCount,
              unansweredCount
            }
          })
        : await tx.userScore.create({
            data: {
              userId: attempt.userId,
              attemptId,
              totalMarks,
              marksSecured,
              percentage,
              grade,
              correctCount,
              wrongCount,
              unansweredCount
            }
          });

      // Calculate section scores
      for (const sectionAttempt of attempt.sectionAttempts) {
        const sectionQuestions = sectionAttempt.section.examQuestions;
        let sectionTotal = 0;
        let sectionSecured = 0;
        let sectionCorrect = 0;
        let sectionWrong = 0;
        let sectionUnanswered = 0;

        for (const sq of sectionQuestions) {
          const answer = attempt.answers.find(a => a.questionId === sq.questionId);
          if (answer) {
            sectionTotal += sq.question.marks;
            sectionSecured += answer.marksAwarded || 0;
            
            if (answer.isCorrect === true) sectionCorrect++;
            else if (answer.isCorrect === false) sectionWrong++;
            else sectionUnanswered++;
          }
        }

        const sectionPercentage = sectionTotal > 0 ? (sectionSecured / sectionTotal) * 100 : 0;
        const performanceStatus = this.getPerformanceStatus(sectionPercentage);

        const existingSectionScore = await tx.sectionScore.findFirst({
          where: {
            sectionId: sectionAttempt.sectionId,
            attemptId
          }
        });

        if (existingSectionScore) {
          await tx.sectionScore.update({
            where: { id: existingSectionScore.id },
            data: {
              totalMarks: sectionTotal,
              marksSecured: sectionSecured,
              percentage: sectionPercentage,
              performanceStatus
            }
          });
        } else {
          await tx.sectionScore.create({
            data: {
              sectionId: sectionAttempt.sectionId,
              attemptId,
              totalMarks: sectionTotal,
              marksSecured: sectionSecured,
              percentage: sectionPercentage,
              performanceStatus
            }
          });
        }
      }

      // Update topic scores
      await this.updateTopicScores(attempt.userId, attempt.answers, tx);

      return userScore;
    });
  }

  private evaluateAnswer(question: any, userAnswer: any) {
    let isCorrect: boolean | null = false;
    let marks = 0;

    switch (question.questionType) {
      case QuestionType.MCQ:
      case QuestionType.TRUE_FALSE:
        // For MCQ, check if selected option matches correct answer
        const correctOption = question.options.find((opt: any) => opt.isCorrect);
        isCorrect = correctOption && userAnswer === correctOption.optionNumber;
        marks = isCorrect ? question.marks : -question.negativeMarks;
        break;

      case QuestionType.MSQ:
        // For multiple select, check if all correct options are selected
        const correctOptions = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.optionNumber);
        const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const correctSelected = correctOptions.every((opt: number) => selectedOptions.includes(opt));
        const incorrectSelected = selectedOptions.some((opt: number) => !correctOptions.includes(opt));
        isCorrect = correctSelected && !incorrectSelected && selectedOptions.length === correctOptions.length;
        marks = isCorrect ? question.marks : (incorrectSelected ? -question.negativeMarks : 0);
        break;

      case QuestionType.FILL_BLANK:
        // For fill in the blank, exact match or case-insensitive
        if (typeof question.correctAnswer === 'string') {
          isCorrect = userAnswer.toString().toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        } else if (Array.isArray(question.correctAnswer)) {
          isCorrect = question.correctAnswer.some((answer: string) => 
            userAnswer.toString().toLowerCase().trim() === answer.toLowerCase().trim()
          );
        }
        marks = isCorrect ? question.marks : 0;
        break;

      case QuestionType.MATCH_COLUMN:
        // For match the columns, check all matches
        if (typeof userAnswer === 'object' && typeof question.correctAnswer === 'object') {
          isCorrect = Object.keys(question.correctAnswer).every(
            key => userAnswer[key] === question.correctAnswer[key]
          );
        }
        marks = isCorrect ? question.marks : 0;
        break;

      case QuestionType.SHORT_ANSWER:
      case QuestionType.LONG_ANSWER:
      case QuestionType.PASSAGE_BASED:
      case QuestionType.NUMERIC:
        // Descriptive questions need manual grading
        isCorrect = null; // Will be graded manually
        marks = 0;
        break;

      default:
        marks = 0;
    }

    return { isCorrect, marks };
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
  }

  private getPerformanceStatus(percentage: number): PerformanceStatus {
    if (percentage >= 80) return PerformanceStatus.STRENGTH;
    if (percentage >= 60) return PerformanceStatus.OPPORTUNITY;
    if (percentage >= 40) return PerformanceStatus.WEAKNESS;
    return PerformanceStatus.THREAT;
  }

  private async updateTopicScores(userId: string, answers: any[], tx: any) {
    // Group answers by topic
    const topicGroups: Record<string, any[]> = {};
    
    for (const answer of answers) {
      const topicId = answer.question.topicId;
      if (!topicGroups[topicId]) {
        topicGroups[topicId] = [];
      }
      topicGroups[topicId].push(answer);
    }

    // Update each topic score
    for (const [topicId, topicAnswers] of Object.entries(topicGroups)) {
      const totalQuestions = topicAnswers.length;
      const correctQuestions = topicAnswers.filter(a => a.isCorrect === true).length;
      const percentage = (correctQuestions / totalQuestions) * 100;
      const performanceStatus = this.getPerformanceStatus(percentage);

      const existing = await tx.topicScore.findFirst({
        where: { topicId, userId }
      });

      if (existing) {
        await tx.topicScore.update({
          where: { id: existing.id },
          data: {
            totalQuestions,
            correctQuestions,
            percentage,
            performanceStatus
          }
        });
      } else {
        await tx.topicScore.create({
          data: {
            topicId,
            userId,
            totalQuestions,
            correctQuestions,
            percentage,
            performanceStatus
          }
        });
      }
    }
  }

  async getScore(attemptId: string, userId?: string) {
    const where: any = { attemptId };
    if (userId) {
      where.userId = userId;
    }

    const score = await prisma.userScore.findFirst({
      where,
      include: {
        attempt: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                totalMarks: true
              }
            }
          }
        }
      }
    });

    if (score) {
      return score;
    }

    // If no score yet, auto-evaluate when attempt is submitted/auto-submitted
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      select: { status: true, userId: true }
    });

    if (!attempt) {
      return null;
    }

    if (userId && attempt.userId !== userId) {
      return null;
    }

    if (attempt.status === 'SUBMITTED' || attempt.status === 'AUTO_SUBMITTED') {
      try {
        await this.evaluateAttempt(attemptId);
      } catch (error) {
        console.error('Auto evaluation (on score fetch) failed:', error);
      }
      return prisma.userScore.findFirst({
        where,
        include: {
          attempt: {
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  totalMarks: true
                }
              }
            }
          }
        }
      });
    }

    return null;
  }

  async getResults(attemptId: string, userId?: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        },
        scores: true,
        sectionAttempts: {
          include: {
            section: true
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: {
                  orderBy: { optionNumber: 'asc' }
                },
                topic: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!attempt) {
      return null;
    }

    if (userId && attempt.userId !== userId) {
      return null;
    }

    // Get topic-wise performance
    const topicPerformance = await prisma.topicScore.findMany({
      where: { userId: attempt.userId },
      include: {
        topic: true
      }
    });

    const sectionScores = await prisma.sectionScore.findMany({
      where: { attemptId }
    });

    const sectionsById = new Map(
      attempt.sectionAttempts.map(sa => [
        sa.sectionId,
        {
          id: sa.section.id,
          name: sa.section.name,
          sectionNumber: sa.section.sectionNumber,
          totalMarks: sa.section.totalMarks,
          timeAllotted: sa.section.timeAllotted
        }
      ])
    );

    const sectionScoresWithSection = sectionScores.map(score => ({
      ...score,
      section: sectionsById.get(score.sectionId) || null
    }));

    return {
      attempt,
      score: attempt.scores[0],
      sectionScores: sectionScoresWithSection,
      topicPerformance,
      summary: {
        totalQuestions: attempt.answers.length,
        attempted: attempt.answers.filter(a => a.userAnswer !== null).length,
        correct: attempt.scores[0]?.correctCount || 0,
        wrong: attempt.scores[0]?.wrongCount || 0,
        unanswered: attempt.scores[0]?.unansweredCount || 0,
        timeSpent: attempt.timeSpent
      }
    };
  }

  async getSectionScores(attemptId: string, userId?: string) {
    const where: any = { attemptId };
    
    if (userId) {
      const attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId, userId }
      });
      if (!attempt) {
        throw new Error('Attempt not found');
      }
    }

    const sectionScores = await prisma.sectionScore.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    const sections = await prisma.section.findMany({
      where: { id: { in: sectionScores.map(s => s.sectionId) } },
      select: {
        id: true,
        name: true,
        sectionNumber: true,
        totalMarks: true,
        timeAllotted: true,
        examId: true
      }
    });

    const sectionsById = new Map(sections.map(section => [section.id, section]));

    return sectionScores.map(score => ({
      ...score,
      section: sectionsById.get(score.sectionId) || null
    }));
  }

  async getUserAttemptHistory(userId: string, filters: {
    page: number;
    limit: number;
    examId?: string;
  }) {
    const where: any = { userId };
    
    if (filters.examId) {
      where.examId = filters.examId;
    }

    const [scores, total] = await Promise.all([
      prisma.userScore.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          attempt: {
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  examType: true,
                  duration: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userScore.count({ where })
    ]);

    return {
      data: scores,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }

  async getExamResults(examId: string, page: number, limit: number) {
    const where = { examId: undefined };

    // First get attempts for this exam
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      select: { id: true }
    });

    const attemptIds = attempts.map(a => a.id);

    const [scores, total] = await Promise.all([
      prisma.userScore.findMany({
        where: {
          attemptId: {
            in: attemptIds
          }
        },
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
          attempt: {
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  totalMarks: true
                }
              }
            }
          }
        },
        orderBy: [
          { percentage: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.userScore.count({
        where: {
          attemptId: {
            in: attemptIds
          }
        }
      })
    ]);

    return {
      data: scores,
      total,
      page,
      limit
    };
  }

  async getLeaderboard(examId: string, limit: number) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      select: { id: true }
    });

    const attemptIds = attempts.map(a => a.id);

    return prisma.userScore.findMany({
      where: {
        attemptId: {
          in: attemptIds
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: [
        { percentage: 'desc' },
        { createdAt: 'asc' } // Earlier submission gets priority in ties
      ],
      take: limit
    });
  }

  async getExamStatistics(examId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      select: { id: true }
    });

    const attemptIds = attempts.map(a => a.id);

    const [scores, stats] = await Promise.all([
      prisma.userScore.findMany({
        where: {
          attemptId: {
            in: attemptIds
          }
        },
        select: {
          percentage: true,
          marksSecured: true,
          correctCount: true,
          wrongCount: true,
          unansweredCount: true,
          grade: true
        }
      }),
      prisma.examAttempt.groupBy({
        by: ['status'],
        where: { examId },
        _count: true
      })
    ]);

    if (scores.length === 0) {
      return {
        totalAttempts: attempts.length,
        statusBreakdown: stats,
        statistics: null
      };
    }

    const totalMarks = scores.reduce((sum, s) => sum + s.marksSecured, 0);
    const avgPercentage = scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length;
    const highestScore = Math.max(...scores.map(s => s.percentage));
    const lowestScore = Math.min(...scores.map(s => s.percentage));
    
    const gradeDistribution = scores.reduce((acc, score) => {
      acc[score.grade || 'N/A'] = (acc[score.grade || 'N/A'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAttempts: attempts.length,
      completedAttempts: scores.length,
      statusBreakdown: stats,
      statistics: {
        averagePercentage: Math.round(avgPercentage * 100) / 100,
        highestScore,
        lowestScore,
        averageMarks: Math.round((totalMarks / scores.length) * 100) / 100,
        gradeDistribution
      }
    };
  }

  async updateManualScore(
    attemptId: string,
    questionId: string,
    marksAwarded: number,
    isCorrect: boolean,
    feedback?: string,
    userId?: string
  ) {
    const existing = await prisma.questionAnswer.findFirst({
      where: { attemptId, questionId }
    });

    if (!existing) {
      throw new Error('Answer not found');
    }

    return prisma.questionAnswer.update({
      where: { id: existing.id },
      data: {
        marksAwarded,
        isCorrect
      }
    });
  }

  async bulkGrade(attemptId: string, grading: Array<{
    questionId: string;
    marksAwarded: number;
    isCorrect: boolean;
    feedback?: string;
  }>, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const grade of grading) {
        const existing = await tx.questionAnswer.findFirst({
          where: { attemptId, questionId: grade.questionId }
        });

        if (!existing) {
          continue;
        }

        const updated = await tx.questionAnswer.update({
          where: { id: existing.id },
          data: {
            marksAwarded: grade.marksAwarded,
            isCorrect: grade.isCorrect
          }
        });
        results.push(updated);
      }

      // Recpute total score after bulk grading
      await this.recomputeScore(attemptId, userId);

      return results;
    });
  }

  async recomputeScore(attemptId: string, userId?: string) {
    return this.evaluateAttempt(attemptId);
  }
}

export const scoringService = new ScoringService();
