import { Schema, model } from 'mongoose';
var AchievementCategoryEnum;
(function (AchievementCategoryEnum) {
    AchievementCategoryEnum["MILESTONE"] = "MILESTONE";
    AchievementCategoryEnum["PERFORMANCE"] = "PERFORMANCE";
    AchievementCategoryEnum["CONSISTENCY"] = "CONSISTENCY";
    AchievementCategoryEnum["MASTERY"] = "MASTERY";
})(AchievementCategoryEnum || (AchievementCategoryEnum = {}));
var AchievementRarityEnum;
(function (AchievementRarityEnum) {
    AchievementRarityEnum["COMMON"] = "COMMON";
    AchievementRarityEnum["RARE"] = "RARE";
    AchievementRarityEnum["EPIC"] = "EPIC";
    AchievementRarityEnum["LEGENDARY"] = "LEGENDARY";
})(AchievementRarityEnum || (AchievementRarityEnum = {}));
const achievementSchema = new Schema({
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
export default model('Achievement', achievementSchema);
//# sourceMappingURL=achievement.model.js.map