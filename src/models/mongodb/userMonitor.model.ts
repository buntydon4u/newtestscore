import { Schema, model, Document } from 'mongoose';

export interface IUserMonitor extends Document {
  userId: string;
  sessionId?: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
  activityLog: Array<{
    action: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userMonitorSchema = new Schema<IUserMonitor>({
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

export default model<IUserMonitor>('UserMonitor', userMonitorSchema);
