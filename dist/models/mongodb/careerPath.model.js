import { Schema, model } from 'mongoose';
const careerPathSchema = new Schema({
    userId: { type: String, required: true, index: true },
    streamId: String,
    stream: { type: String, required: true },
    suggestedCareers: [{
            name: String,
            description: String,
            educationRequired: String,
            salaryRange: String
        }],
    milestones: [{
            year: Number,
            goal: String
        }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
export default model('CareerPath', careerPathSchema);
//# sourceMappingURL=careerPath.model.js.map