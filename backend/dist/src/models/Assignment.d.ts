import mongoose, { Document } from 'mongoose';
import { IAssignment } from '../types';
export interface AssignmentDocument extends Omit<IAssignment, '_id'>, Document {
}
export declare const Assignment: mongoose.Model<AssignmentDocument, {}, {}, {}, mongoose.Document<unknown, {}, AssignmentDocument, {}, {}> & AssignmentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Assignment.d.ts.map