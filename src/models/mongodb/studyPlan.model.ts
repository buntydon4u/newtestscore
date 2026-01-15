import { Schema, model, Document } from 'mongoose';

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

const studyPlanSchema = new Schema<IStudyPlan>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  goals: [String],
  tasks: [String],
  status: { type: String, default: 'ACTIVE' },
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<IStudyPlan>('StudyPlan', studyPlanSchema);
