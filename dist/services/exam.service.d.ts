export declare class ExamService {
    list(where: any, orderBy: any, skip: number, take: number): Promise<({
        class: ({
            board: {
                name: string;
                id: string;
                isActive: boolean;
                country: string;
                shortName: string;
                website: string | null;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            description: string | null;
            boardId: string;
            level: number;
        }) | null;
        board: {
            name: string;
            id: string;
            code: string;
        } | null;
        series: {
            year: number;
            name: string;
            id: string;
            boardId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        title: string;
        description: string | null;
        classId: string | null;
        boardId: string | null;
        seriesId: string | null;
        examType: import(".prisma/client").$Enums.ExamType;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        duration: number;
        totalMarks: number;
        isNegativeMarking: boolean;
        negativeMarkingValue: number | null;
        isPracticeMode: boolean;
        blueprintId: string | null;
    })[]>;
    count(where: any): Promise<number>;
    getById(id: string): Promise<({
        class: ({
            board: {
                name: string;
                id: string;
                isActive: boolean;
                country: string;
                shortName: string;
                website: string | null;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            description: string | null;
            boardId: string;
            level: number;
        }) | null;
        board: {
            name: string;
            id: string;
            code: string;
        } | null;
        series: {
            year: number;
            name: string;
            id: string;
            boardId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        title: string;
        description: string | null;
        classId: string | null;
        boardId: string | null;
        seriesId: string | null;
        examType: import(".prisma/client").$Enums.ExamType;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        duration: number;
        totalMarks: number;
        isNegativeMarking: boolean;
        negativeMarkingValue: number | null;
        isPracticeMode: boolean;
        blueprintId: string | null;
    }) | null>;
    create(data: any, userId: string): Promise<{
        class: ({
            board: {
                name: string;
                id: string;
                isActive: boolean;
                country: string;
                shortName: string;
                website: string | null;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            description: string | null;
            boardId: string;
            level: number;
        }) | null;
        board: {
            name: string;
            id: string;
            code: string;
        } | null;
        series: {
            year: number;
            name: string;
            id: string;
            boardId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        title: string;
        description: string | null;
        classId: string | null;
        boardId: string | null;
        seriesId: string | null;
        examType: import(".prisma/client").$Enums.ExamType;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        duration: number;
        totalMarks: number;
        isNegativeMarking: boolean;
        negativeMarkingValue: number | null;
        isPracticeMode: boolean;
        blueprintId: string | null;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        class: ({
            board: {
                name: string;
                id: string;
                isActive: boolean;
                country: string;
                shortName: string;
                website: string | null;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            description: string | null;
            boardId: string;
            level: number;
        }) | null;
        board: {
            name: string;
            id: string;
            code: string;
        } | null;
        series: {
            year: number;
            name: string;
            id: string;
            boardId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        title: string;
        description: string | null;
        classId: string | null;
        boardId: string | null;
        seriesId: string | null;
        examType: import(".prisma/client").$Enums.ExamType;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        duration: number;
        totalMarks: number;
        isNegativeMarking: boolean;
        negativeMarkingValue: number | null;
        isPracticeMode: boolean;
        blueprintId: string | null;
    }>;
    softDelete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        title: string;
        description: string | null;
        classId: string | null;
        boardId: string | null;
        seriesId: string | null;
        examType: import(".prisma/client").$Enums.ExamType;
        deliveryType: import(".prisma/client").$Enums.DeliveryType;
        duration: number;
        totalMarks: number;
        isNegativeMarking: boolean;
        negativeMarkingValue: number | null;
        isPracticeMode: boolean;
        blueprintId: string | null;
    }>;
    getBoards(): Promise<{
        name: string;
        id: string;
        code: string;
    }[]>;
    getAcademicBoards(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        country: string;
        shortName: string;
        website: string | null;
    }[]>;
    getSeries(boardId?: string): Promise<{
        year: number;
        name: string;
        id: string;
        boardId: string;
    }[]>;
    getClasses(): Promise<({
        board: {
            name: string;
            id: string;
            isActive: boolean;
            country: string;
            shortName: string;
            website: string | null;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        description: string | null;
        boardId: string;
        level: number;
    })[]>;
    getBlueprints(classId?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        classId: string | null;
    }[]>;
    createBoard(data: {
        name: string;
        code: string;
    }, userId: string): Promise<{
        name: string;
        id: string;
        code: string;
    }>;
    createSeries(data: {
        name: string;
        boardId: string;
        year: number;
    }, userId: string): Promise<{
        year: number;
        name: string;
        id: string;
        boardId: string;
    }>;
    createClass(data: {
        name: string;
        level: number;
        boardId: string;
    }, userId: string): Promise<{
        board: {
            name: string;
            id: string;
            isActive: boolean;
            country: string;
            shortName: string;
            website: string | null;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        description: string | null;
        boardId: string;
        level: number;
    }>;
    createBlueprint(data: {
        name: string;
        description?: string;
        classId: string;
    }, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        description: string | null;
        classId: string | null;
    }>;
    createAcademicBoard(data: {
        name: string;
        shortName: string;
        country?: string;
        website?: string;
    }, userId: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        country: string;
        shortName: string;
        website: string | null;
    }>;
    listSchedules(examId: string): Promise<{
        id: string;
        examId: string;
        startDateTime: Date;
        endDateTime: Date;
        capacity: number | null;
        enrolledCount: number;
    }[]>;
    createSchedule(examId: string, data: {
        startDateTime: string | Date;
        endDateTime: string | Date;
        capacity?: number | null;
    }, userId: string): Promise<{
        id: string;
        examId: string;
        startDateTime: Date;
        endDateTime: Date;
        capacity: number | null;
        enrolledCount: number;
    }>;
    enrollInSchedule(examId: string, scheduleId: string, userId: string): Promise<{
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.ExamEnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        scheduleId: string;
        enrolledAt: Date;
        cancelledAt: Date | null;
    }>;
    cancelEnrollment(examId: string, scheduleId: string, userId: string): Promise<{
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.ExamEnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        scheduleId: string;
        enrolledAt: Date;
        cancelledAt: Date | null;
    }>;
    getMyEnrollments(userId: string): Promise<({
        schedule: {
            exam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isDeleted: boolean;
                deletedAt: Date | null;
                deletedBy: string | null;
                title: string;
                description: string | null;
                classId: string | null;
                boardId: string | null;
                seriesId: string | null;
                examType: import(".prisma/client").$Enums.ExamType;
                deliveryType: import(".prisma/client").$Enums.DeliveryType;
                duration: number;
                totalMarks: number;
                isNegativeMarking: boolean;
                negativeMarkingValue: number | null;
                isPracticeMode: boolean;
                blueprintId: string | null;
            };
        } & {
            id: string;
            examId: string;
            startDateTime: Date;
            endDateTime: Date;
            capacity: number | null;
            enrolledCount: number;
        };
    } & {
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.ExamEnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        scheduleId: string;
        enrolledAt: Date;
        cancelledAt: Date | null;
    })[]>;
    listScheduleEnrollments(examId: string, scheduleId: string): Promise<({
        user: {
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            username: string;
            status: import(".prisma/client").$Enums.UserStatus;
        };
    } & {
        userId: string;
        id: string;
        status: import(".prisma/client").$Enums.ExamEnrollmentStatus;
        createdAt: Date;
        updatedAt: Date;
        scheduleId: string;
        enrolledAt: Date;
        cancelledAt: Date | null;
    })[]>;
}
export declare const examService: ExamService;
//# sourceMappingURL=exam.service.d.ts.map