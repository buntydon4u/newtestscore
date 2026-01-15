import { Schema, model } from 'mongoose';
const skillTreeSchema = new Schema({
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
export default model('SkillTree', skillTreeSchema);
//# sourceMappingURL=skillTree.model.js.map