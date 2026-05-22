import mongoose, { Document } from 'mongoose';
import { IGenerationResult } from '../types';
export interface GenerationResultDocument extends Omit<IGenerationResult, '_id'>, Document {
}
export declare const GenerationResult: mongoose.Model<GenerationResultDocument, {}, {}, {}, mongoose.Document<unknown, {}, GenerationResultDocument, {}, {}> & GenerationResultDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GenerationResult.d.ts.map