export declare class SectionService {
    list(where: any, orderBy: any, skip: number, take: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        description: string | null;
        totalMarks: number;
        examId: string;
        sectionNumber: number;
        timeAllotted: number;
    }[]>;
    count(where: any): Promise<number>;
    getById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        description: string | null;
        totalMarks: number;
        examId: string;
        sectionNumber: number;
        timeAllotted: number;
    } | null>;
    create(data: any, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        description: string | null;
        totalMarks: number;
        examId: string;
        sectionNumber: number;
        timeAllotted: number;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        description: string | null;
        totalMarks: number;
        examId: string;
        sectionNumber: number;
        timeAllotted: number;
    }>;
    softDelete(id: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        description: string | null;
        totalMarks: number;
        examId: string;
        sectionNumber: number;
        timeAllotted: number;
    }>;
}
export declare const sectionService: SectionService;
//# sourceMappingURL=section.service.d.ts.map