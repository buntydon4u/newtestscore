import { Document } from 'mongoose';
export interface IStreamRecommendation extends Document {
    userId: string;
    recommendedStream: string;
    careerOptions: string[];
    matchPercentage: number;
    basedOnScores: boolean;
    basedOnInterests: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IStreamRecommendation, {}, {}, {}, Document<unknown, {}, IStreamRecommendation> & IStreamRecommendation & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=streamRecommendation.model.d.ts.map