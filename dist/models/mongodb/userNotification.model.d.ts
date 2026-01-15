import { Document } from 'mongoose';
declare enum DeliveryMethodEnum {
    IN_APP = "IN_APP",
    EMAIL = "EMAIL",
    SMS = "SMS"
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
declare const _default: import("mongoose").Model<IUserNotification, {}, {}, {}, Document<unknown, {}, IUserNotification> & IUserNotification & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=userNotification.model.d.ts.map