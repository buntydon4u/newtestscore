import { Schema, model, Document } from 'mongoose';

enum AchievementCategoryEnum {
  MILESTONE = 'MILESTONE',
  PERFORMANCE = 'PERFORMANCE',
  CONSISTENCY = 'CONSISTENCY',
  MASTERY = 'MASTERY'
}

enum AchievementRarityEnum {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export interface IAchievement extends Document {
  userId: string;
  title: string;
  description: string;
  category: AchievementCategoryEnum;
  rarity: AchievementRarityEnum;
  badgeColor?: string;
  badgeIcon?: string;
  badgeUrl?: string;
  unlockedAt: Date;
  createdAt: Date;
}

const achievementSchema = new Schema<IAchievement>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: Object.values(AchievementCategoryEnum),
    required: true 
  },
  rarity: { 
    type: String, 
    enum: Object.values(AchievementRarityEnum),
    default: AchievementRarityEnum.COMMON 
  },
  badgeColor: String,
  badgeIcon: String,
  badgeUrl: String,
  unlockedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, index: true }
});

achievementSchema.index({ userId: 1, rarity: 1 });

export default model<IAchievement>('Achievement', achievementSchema);
