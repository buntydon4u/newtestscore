import { Document } from 'mongoose';
export interface IVirtualMentorLog extends Document {
    userId: string;
    mentorType: string;
    query: string;
    response: string;
    rating?: number;
    sessionDuration: number;
    createdAt: Date;
}
declare const _default: import("mongoose").Model<IVirtualMentorLog, {}, {}, {}, Document<unknown, {}, IVirtualMentorLog> & IVirtualMentorLog & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=virtualMentorLog.model.d.ts.map