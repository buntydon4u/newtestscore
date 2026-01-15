import { Schema, model } from 'mongoose';
var DeliveryMethodEnum;
(function (DeliveryMethodEnum) {
    DeliveryMethodEnum["IN_APP"] = "IN_APP";
    DeliveryMethodEnum["EMAIL"] = "EMAIL";
    DeliveryMethodEnum["SMS"] = "SMS";
})(DeliveryMethodEnum || (DeliveryMethodEnum = {}));
const userNotificationSchema = new Schema({
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
export default model('UserNotification', userNotificationSchema);
//# sourceMappingURL=userNotification.model.js.map