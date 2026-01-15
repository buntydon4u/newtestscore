import { prisma } from '../config/database.js';
export class ExamService {
    async list(where, orderBy, skip, take) {
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
    async count(where) {
        return prisma.exam.count({
            where: {
                isDeleted: false,
                ...where,
            }
        });
    }
    async getById(id) {
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
    async create(data, userId) {
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
    async update(id, data, userId) {
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
    async softDelete(id, userId) {
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
    async getSeries(boardId) {
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
    async getBlueprints(classId) {
        return prisma.examBlueprint.findMany({
            where: classId ? { classId } : undefined,
            orderBy: { name: 'asc' },
        });
    }
    // Create master data
    async createBoard(data, userId) {
        return prisma.examBoard.create({
            data: {
                name: data.name,
                code: data.code,
            },
        });
    }
    async createSeries(data, userId) {
        return prisma.examSeries.create({
            data: {
                name: data.name,
                boardId: data.boardId,
                year: data.year,
            },
        });
    }
    async createClass(data, userId) {
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
    async createBlueprint(data, userId) {
        return prisma.examBlueprint.create({
            data: {
                name: data.name,
                description: data.description,
                classId: data.classId,
            },
        });
    }
    async createAcademicBoard(data, userId) {
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
//# sourceMappingURL=exam.service.js.map