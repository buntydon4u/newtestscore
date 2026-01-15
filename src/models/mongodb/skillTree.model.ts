import { Schema, model, Document } from 'mongoose';

export interface ISkillTree extends Document {
  userId: string;
  skill: string;
  level: number;
  experience: number;
  maxExperience: number;
  subSkills: Array<{
    name: string;
    level: number;
    progress: number;
  }>;
  unlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillTreeSchema = new Schema<ISkillTree>({
  userId: { type: String, required: true, index: true },
  skill: { type: String, required: true },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  maxExperience: { type: Number, default: 100 },
  subSkills: [{
    name: String,
    level: { type: Number, default: 1 },
    progress: { type: Number, default: 0 }
  }],
  unlocked: { type: Boolean, default: false },
  unlockedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

skillTreeSchema.index({ userId: 1, skill: 1 });

export default model<ISkillTree>('SkillTree', skillTreeSchema);
