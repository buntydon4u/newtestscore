import { Document } from 'mongoose';
export interface IStudyChallenge extends Document {
    name: string;
    description: string;
    difficulty: string;
    topic?: string;
    targetScore: number;
    duration: number;
    rewards: {
        points: number;
        badge?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IStudyChallenge, {}, {}, {}, Document<unknown, {}, IStudyChallenge> & IStudyChallenge & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=studyChallenge.model.d.ts.map