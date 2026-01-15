import { Schema, model, Document } from 'mongoose';

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

const streamRecommendationSchema = new Schema<IStreamRecommendation>({
  userId: { type: String, required: true, index: true },
  recommendedStream: { type: String, required: true },
  careerOptions: [String],
  matchPercentage: { type: Number, default: 0 },
  basedOnScores: { type: Boolean, default: true },
  basedOnInterests: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<IStreamRecommendation>('StreamRecommendation', streamRecommendationSchema);
