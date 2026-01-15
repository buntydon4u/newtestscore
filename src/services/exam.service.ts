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
}

export const examService = new ExamService();