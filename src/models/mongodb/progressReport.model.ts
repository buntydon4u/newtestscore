import { Schema, model, Document } from 'mongoose';

enum ReportPeriodEnum {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
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

const progressReportSchema = new Schema<IProgressReport>({
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

export default model<IProgressReport>('ProgressReport', progressReportSchema);
