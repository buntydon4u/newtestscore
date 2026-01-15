import { Document } from 'mongoose';
export interface ISkillTree extends Document {
    userId: string;
    skill: string;
    level: number;
    experience: number;
    maxExperience: number;
    subSkills: Array<{
        name: string;
        level: number;
        progress: number;
    }>;
    unlocked: boolean;
    unlockedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<ISkillTree, {}, {}, {}, Document<unknown, {}, ISkillTree> & ISkillTree & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=skillTree.model.d.ts.map