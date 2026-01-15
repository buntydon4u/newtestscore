import { Document } from 'mongoose';
export interface IChallengeParticipant extends Document {
    userId: string;
    challengeId: string;
    status: string;
    score?: number;
    startedAt: Date;
    completedAt?: Date;
    createdAt: Date;
}
declare const _default: import("mongoose").Model<IChallengeParticipant, {}, {}, {}, Document<unknown, {}, IChallengeParticipant> & IChallengeParticipant & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=challengeParticipant.model.d.ts.map