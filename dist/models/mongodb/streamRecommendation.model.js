import { Schema, model } from 'mongoose';
const streamRecommendationSchema = new Schema({
    userId: { type: String, required: true, index: true },
    recommendedStream: { type: String, required: true },
    careerOptions: [String],
    matchPercentage: { type: Number, default: 0 },
    basedOnScores: { type: Boolean, default: true },
    basedOnInterests: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export default model('StreamRecommendation', streamRecommendationSchema);
//# sourceMappingURL=streamRecommendation.model.js.map