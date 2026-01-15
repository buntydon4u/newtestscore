import { Document } from 'mongoose';
export interface ISWOTAnalysis extends Document {
    userId: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<ISWOTAnalysis, {}, {}, {}, Document<unknown, {}, ISWOTAnalysis> & ISWOTAnalysis & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=swotAnalysis.model.d.ts.map