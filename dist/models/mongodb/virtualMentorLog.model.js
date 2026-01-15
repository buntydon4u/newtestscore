import { Schema, model } from 'mongoose';
const virtualMentorLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    mentorType: { type: String, required: true },
    query: { type: String, required: true },
    response: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    sessionDuration: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true }
});
export default model('VirtualMentorLog', virtualMentorLogSchema);
//# sourceMappingURL=virtualMentorLog.model.js.map