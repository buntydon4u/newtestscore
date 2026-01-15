import { prisma } from '../config/database.js';
export class AuditService {
    async logAction(data) {
        try {
            await prisma.userAuditLog.create({
                data: {
                    userId: data.userId || 'SYSTEM',
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    oldValues: data.oldValues || undefined,
                    newValues: data.newValues || undefined,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (error) {
            console.error('Failed to log audit action:', error);
        }
    }
    async getUserAuditLogs(userId, limit = 50, offset = 0) {
        const logs = await prisma.userAuditLog.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset,
        });
        const total = await prisma.userAuditLog.count({
            where: { userId },
        });
        return {
            logs,
            total,
            limit,
            offset,
        };
    }
    async getAuditLogs(filters, limit = 50, offset = 0) {
        const where = {};
        if (filters?.userId)
            where.userId = filters.userId;
        if (filters?.action)
            where.action = { contains: filters.action };
        if (filters?.entity)
            where.entity = filters.entity;
        if (filters?.startDate || filters?.endDate) {
            where.timestamp = {};
            if (filters.startDate)
                where.timestamp.gte = filters.startDate;
            if (filters.endDate)
                where.timestamp.lte = filters.endDate;
        }
        const logs = await prisma.userAuditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit,
            skip: offset,
        });
        const total = await prisma.userAuditLog.count({ where });
        return {
            logs,
            total,
            limit,
            offset,
        };
    }
}
export const auditService = new AuditService();
//# sourceMappingURL=audit.service.js.map