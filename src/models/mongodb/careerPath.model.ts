import { Schema, model, Document } from 'mongoose';

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

const careerPathSchema = new Schema<ICareerPath>({
  userId: { type: String, required: true, index: true },
  streamId: String,
  stream: { type: String, required: true },
  suggestedCareers: [{
    name: String,
    description: String,
    educationRequired: String,
    salaryRange: String
  }],
  milestones: [{
    year: Number,
    goal: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<ICareerPath>('CareerPath', careerPathSchema);
