import { Document } from 'mongoose';
export interface IUserMonitor extends Document {
    userId: string;
    sessionId?: string;
    deviceInfo?: {
        userAgent?: string;
        ipAddress?: string;
        deviceType?: string;
    };
    activityLog: Array<{
        action: string;
        timestamp: Date;
        metadata?: Record<string, any>;
    }>;
    lastActivityAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IUserMonitor, {}, {}, {}, Document<unknown, {}, IUserMonitor> & IUserMonitor & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=userMonitor.model.d.ts.map