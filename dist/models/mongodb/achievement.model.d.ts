import { Document } from 'mongoose';
declare enum AchievementCategoryEnum {
    MILESTONE = "MILESTONE",
    PERFORMANCE = "PERFORMANCE",
    CONSISTENCY = "CONSISTENCY",
    MASTERY = "MASTERY"
}
declare enum AchievementRarityEnum {
    COMMON = "COMMON",
    RARE = "RARE",
    EPIC = "EPIC",
    LEGENDARY = "LEGENDARY"
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
declare const _default: import("mongoose").Model<IAchievement, {}, {}, {}, Document<unknown, {}, IAchievement> & IAchievement & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=achievement.model.d.ts.map