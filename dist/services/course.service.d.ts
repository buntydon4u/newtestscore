export declare class CourseService {
    list(where: any, orderBy: any, skip: number, take: number): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        instructorId: string | null;
        instructor: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        } | null;
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
        isActive: boolean;
        description: string | null;
        code: string;
        instructorId: string | null;
        instructor: {
            profile: {
                firstName: string;
                lastName: string;
            } | null;
        } | null;
    } | null>;
    create(data: any, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        instructorId: string | null;
    }>;
    update(id: string, data: any, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        instructorId: string | null;
    }>;
    softDelete(id: string, userId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedBy: string | null;
        isActive: boolean;
        description: string | null;
        code: string;
        instructorId: string | null;
    }>;
}
export declare const courseService: CourseService;
//# sourceMappingURL=course.service.d.ts.map