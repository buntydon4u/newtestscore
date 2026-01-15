import { Schema, model } from 'mongoose';
const challengeParticipantSchema = new Schema({
    userId: { type: String, required: true, index: true },
    challengeId: { type: String, required: true, index: true },
    status: { type: String, enum: ['STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'STARTED' },
    score: Number,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    createdAt: { type: Date, default: Date.now, index: true }
});
challengeParticipantSchema.index({ userId: 1, challengeId: 1 });
export default model('ChallengeParticipant', challengeParticipantSchema);
//# sourceMappingURL=challengeParticipant.model.js.map