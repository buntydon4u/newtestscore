import { Schema, model, Document } from 'mongoose';

enum DeliveryMethodEnum {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export interface IUserNotification extends Document {
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  deliveryMethod: DeliveryMethodEnum;
  deliveryStatus: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationSchema = new Schema<IUserNotification>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  deliveryMethod: { 
    type: String, 
    enum: Object.values(DeliveryMethodEnum),
    default: DeliveryMethodEnum.IN_APP 
  },
  deliveryStatus: { type: String, default: 'PENDING' },
  relatedEntityType: String,
  relatedEntityId: String,
  scheduledFor: Date,
  sentAt: Date,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

userNotificationSchema.index({ userId: 1, createdAt: -1 });

export default model<IUserNotification>('UserNotification', userNotificationSchema);
