import { Schema, model, Document } from 'mongoose';

export interface IVirtualMentorLog extends Document {
  userId: string;
  mentorType: string;
  query: string;
  response: string;
  rating?: number;
  sessionDuration: number;
  createdAt: Date;
}

const virtualMentorLogSchema = new Schema<IVirtualMentorLog>({
  userId: { type: String, required: true, index: true },
  mentorType: { type: String, required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  sessionDuration: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default model<IVirtualMentorLog>('VirtualMentorLog', virtualMentorLogSchema);
