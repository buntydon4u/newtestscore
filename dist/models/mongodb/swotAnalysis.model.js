import { Schema, model } from 'mongoose';
const swotAnalysisSchema = new Schema({
    userId: { type: String, required: true, index: true, unique: true },
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export default model('SWOTAnalysis', swotAnalysisSchema);
//# sourceMappingURL=swotAnalysis.model.js.map