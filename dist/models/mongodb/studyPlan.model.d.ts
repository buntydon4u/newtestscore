import { Document } from 'mongoose';
export interface IStudyPlan extends Document {
    userId: string;
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    goals: string[];
    tasks: string[];
    status: string;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IStudyPlan, {}, {}, {}, Document<unknown, {}, IStudyPlan> & IStudyPlan & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=studyPlan.model.d.ts.map