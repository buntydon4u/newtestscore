export interface AuditLogData {
    userId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    logAction(data: AuditLogData): Promise<void>;
    getUserAuditLogs(userId: string, limit?: number, offset?: number): Promise<{
        logs: {
            userId: string;
            id: string;
            isDeleted: boolean;
            deletedAt: Date | null;
            isActive: boolean;
            ipAddress: string | null;
            userAgent: string | null;
            action: string;
            entity: string | null;
            entityId: string | null;
            oldValues: import(".prisma/client/runtime/library.js").JsonValue | null;
            newValues: import(".prisma/client/runtime/library.js").JsonValue | null;
            timestamp: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getAuditLogs(filters?: {
        userId?: string;
        action?: string;
        entity?: string;
        startDate?: Date;
        endDate?: Date;
    }, limit?: number, offset?: number): Promise<{
        logs: {
            userId: string;
            id: string;
            isDeleted: boolean;
            deletedAt: Date | null;
            isActive: boolean;
            ipAddress: string | null;
            userAgent: string | null;
            action: string;
            entity: string | null;
            entityId: string | null;
            oldValues: import(".prisma/client/runtime/library.js").JsonValue | null;
            newValues: import(".prisma/client/runtime/library.js").JsonValue | null;
            timestamp: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
}
export declare const auditService: AuditService;
//# sourceMappingURL=audit.service.d.ts.map