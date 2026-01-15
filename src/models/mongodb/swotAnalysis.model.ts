import { Schema, model, Document } from 'mongoose';

export interface ISWOTAnalysis extends Document {
  userId: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  createdAt: Date;
  updatedAt: Date;
}

const swotAnalysisSchema = new Schema<ISWOTAnalysis>({
  userId: { type: String, required: true, index: true, unique: true },
  strengths: [String],
  weaknesses: [String],
  opportunities: [String],
  threats: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<ISWOTAnalysis>('SWOTAnalysis', swotAnalysisSchema);
