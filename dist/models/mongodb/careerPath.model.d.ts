import { Document } from 'mongoose';
export interface ICareerPath extends Document {
    userId: string;
    streamId?: string;
    stream: string;
    suggestedCareers: Array<{
        name: string;
        description?: string;
        educationRequired?: string;
        salaryRange?: string;
    }>;
    milestones?: Array<{
        year: number;
        goal: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<ICareerPath, {}, {}, {}, Document<unknown, {}, ICareerPath> & ICareerPath & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=careerPath.model.d.ts.map