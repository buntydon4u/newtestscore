import { Schema, model } from 'mongoose';
var ReportPeriodEnum;
(function (ReportPeriodEnum) {
    ReportPeriodEnum["WEEKLY"] = "WEEKLY";
    ReportPeriodEnum["MONTHLY"] = "MONTHLY";
    ReportPeriodEnum["QUARTERLY"] = "QUARTERLY";
    ReportPeriodEnum["YEARLY"] = "YEARLY";
})(ReportPeriodEnum || (ReportPeriodEnum = {}));
const progressReportSchema = new Schema({
    userId: { type: String, required: true, index: true },
    reportPeriod: {
        type: String,
        enum: Object.values(ReportPeriodEnum),
        required: true
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    overallProgress: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    studyHours: { type: Number, default: 0 },
    examCount: { type: Number, default: 0 },
    topicsAttempted: { type: Number, default: 0 },
    strengths: [String],
    improvements: [String],
    recommendations: [String],
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});
progressReportSchema.index({ userId: 1, createdAt: -1 });
export default model('ProgressReport', progressReportSchema);
//# sourceMappingURL=progressReport.model.js.map