import { Schema, model } from 'mongoose';
const userMonitorSchema = new Schema({
    userId: { type: String, required: true, index: true },
    sessionId: String,
    deviceInfo: {
        userAgent: String,
        ipAddress: String,
        deviceType: String
    },
    activityLog: [{
            action: String,
            timestamp: { type: Date, default: Date.now },
            metadata: Schema.Types.Mixed
        }],
    lastActivityAt: Date,
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
});
export default model('UserMonitor', userMonitorSchema);
//# sourceMappingURL=userMonitor.model.js.map