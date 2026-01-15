import { Schema, model } from 'mongoose';
const studyPlanSchema = new Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    goals: [String],
    tasks: [String],
    status: { type: String, default: 'ACTIVE' },
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export default model('StudyPlan', studyPlanSchema);
//# sourceMappingURL=studyPlan.model.js.map