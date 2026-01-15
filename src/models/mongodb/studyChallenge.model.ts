import { Schema, model, Document } from 'mongoose';

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

const studyChallengeSchema = new Schema<IStudyChallenge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
  topic: String,
  targetScore: { type: Number, required: true },
  duration: { type: Number, required: true },
  rewards: {
    points: { type: Number, default: 0 },
    badge: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default model<IStudyChallenge>('StudyChallenge', studyChallengeSchema);
