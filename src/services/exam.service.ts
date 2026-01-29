import { prisma } from '../config/database.js';

export class ExamService {
  async list(where: any, orderBy: any, skip: number, take: number) {
    return prisma.exam.findMany({
      where: {
        isDeleted: false,
        ...where,
      },
      orderBy,
      skip,
      take,
      include: {
        class: {
          include: {
            board: true,
          },
        },
        board: true,
        series: true,
      },
    });
  }

  async count(where: any) {
    return prisma.exam.count({ 
      where: {
        isDeleted: false,
        ...where,
      }
    });
  }

  async getById(id: string) {
    return prisma.exam.findUnique({
      where: { id, isDeleted: false },
      include: {
        class: {
          include: {
            board: true,
          },
        },
        board: true,
        series: true,
      },
    });
  }

  async create(data: any, userId: string) {
    const examData = data;
    
    return prisma.exam.create({
      data: {
        ...examData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        class: {
          include: {
            board: true,
          },
        },
        board: true,
        series: true,
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    const examData = data;
    
    return prisma.exam.update({
      where: { id },
      data: {
        ...examData,
        updatedAt: new Date(),
      },
      include: {
        class: {
          include: {
            board: true,
          },
        },
        board: true,
        series: true,
      },
    });
  }

  async softDelete(id: string, userId: string) {
    return prisma.exam.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
  }

  // Get boards for dropdown
  async getBoards() {
    return prisma.examBoard.findMany({
      orderBy: { name: 'asc' },
    });
  }

  // Get academic boards for classes
  async getAcademicBoards() {
    return prisma.academicBoard.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Get series for dropdown
  async getSeries(boardId?: string) {
    return prisma.examSeries.findMany({
      where: boardId ? { boardId } : undefined,
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
    });
  }

  // Get classes for dropdown
  async getClasses() {
    return prisma.class.findMany({
      where: { isActive: true },
      include: {
        board: true,
      },
      orderBy: { level: 'asc' },
    });
  }

  // Get blueprints for dropdown
  async getBlueprints(classId?: string) {
    return prisma.examBlueprint.findMany({
      where: classId ? { classId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  // Create master data
  async createBoard(data: { name: string; code: string }, userId: string) {
    return prisma.examBoard.create({
      data: {
        name: data.name,
        code: data.code,
      },
    });
  }

  async createSeries(data: { name: string; boardId: string; year: number }, userId: string) {
    return prisma.examSeries.create({
      data: {
        name: data.name,
        boardId: data.boardId,
        year: data.year,
      },
    });
  }

  async createClass(data: { name: string; level: number; boardId: string }, userId: string) {
    return prisma.class.create({
      data: {
        name: data.name,
        level: data.level,
        boardId: data.boardId,
      },
      include: {
        board: true,
      },
    });
  }

  async createBlueprint(data: { name: string; description?: string; classId: string }, userId: string) {
    return prisma.examBlueprint.create({
      data: {
        name: data.name,
        description: data.description,
        classId: data.classId,
      },
    });
  }

  async createAcademicBoard(data: { name: string; shortName: string; country?: string; website?: string }, userId: string) {
    return prisma.academicBoard.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        country: data.country || 'India',
        website: data.website,
      },
    });
  }

  async listSchedules(examId: string) {
    return prisma.examSchedule.findMany({
      where: { examId },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async createSchedule(
    examId: string,
    data: { startDateTime: string | Date; endDateTime: string | Date; capacity?: number | null },
    userId: string
  ) {
    return prisma.examSchedule.create({
      data: {
        examId,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
        capacity: data.capacity ?? null,
        enrolledCount: 0,
      },
    });
  }

  async enrollInSchedule(examId: string, scheduleId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const schedule = await tx.examSchedule.findUnique({
        where: { id: scheduleId },
        select: { id: true, examId: true, capacity: true, enrolledCount: true, startDateTime: true, endDateTime: true },
      });

      if (!schedule || schedule.examId !== examId) {
        const err: any = new Error('Schedule not found');
        err.statusCode = 404;
        throw err;
      }

      const enrollment = await tx.examEnrollment.create({
        data: {
          userId,
          scheduleId,
          status: 'ENROLLED',
        },
      });

      const updatedRows = await tx.$executeRaw`
        UPDATE "ExamSchedule"
        SET "enrolledCount" = "enrolledCount" + 1
        WHERE id = ${scheduleId}
          AND (capacity IS NULL OR "enrolledCount" < capacity)
      `;

      if (updatedRows === 0) {
        const err: any = new Error('Schedule capacity full');
        err.statusCode = 409;
        throw err;
      }

      return enrollment;
    });
  }

  async cancelEnrollment(examId: string, scheduleId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const schedule = await tx.examSchedule.findUnique({
        where: { id: scheduleId },
        select: { id: true, examId: true },
      });

      if (!schedule || schedule.examId !== examId) {
        const err: any = new Error('Schedule not found');
        err.statusCode = 404;
        throw err;
      }

      const existing = await tx.examEnrollment.findUnique({
        where: { userId_scheduleId: { userId, scheduleId } },
      });

      if (!existing || existing.status !== 'ENROLLED') {
        const err: any = new Error('Enrollment not found');
        err.statusCode = 404;
        throw err;
      }

      const enrollment = await tx.examEnrollment.update({
        where: { userId_scheduleId: { userId, scheduleId } },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });

      await tx.$executeRaw`
        UPDATE "ExamSchedule"
        SET "enrolledCount" = CASE WHEN "enrolledCount" > 0 THEN "enrolledCount" - 1 ELSE 0 END
        WHERE id = ${scheduleId}
      `;

      return enrollment;
    });
  }

  async getMyEnrollments(userId: string) {
    return prisma.examEnrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        schedule: {
          include: {
            exam: true,
          },
        },
      },
    });
  }

  async listScheduleEnrollments(examId: string, scheduleId: string) {
    const schedule = await prisma.examSchedule.findUnique({
      where: { id: scheduleId },
      select: { id: true, examId: true },
    });

    if (!schedule || schedule.examId !== examId) {
      const err: any = new Error('Schedule not found');
      err.statusCode = 404;
      throw err;
    }

    return prisma.examEnrollment.findMany({
      where: { scheduleId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }
}

export const examService = new ExamService();