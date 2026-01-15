import { Document } from 'mongoose';
declare enum ReportPeriodEnum {
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    YEARLY = "YEARLY"
}
export interface IProgressReport extends Document {
    userId: string;
    reportPeriod: ReportPeriodEnum;
    periodStart: Date;
    periodEnd: Date;
    overallProgress: number;
    averageScore: number;
    studyHours: number;
    examCount: number;
    topicsAttempted: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IProgressReport, {}, {}, {}, Document<unknown, {}, IProgressReport> & IProgressReport & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=progressReport.model.d.ts.map