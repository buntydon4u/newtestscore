import { Schema, model } from 'mongoose';
const studyChallengeSchema = new Schema({
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
export default model('StudyChallenge', studyChallengeSchema);
//# sourceMappingURL=studyChallenge.model.js.map