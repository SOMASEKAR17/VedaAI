import mongoose, { Schema, Document } from 'mongoose';
import { IAssignment, Difficulty, AssignmentStatus } from '../types';

export interface AssignmentDocument extends Omit<IAssignment, '_id'>, Document {}

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one question type is required',
      },
    },
    totalQuestions: { type: Number, required: true, min: 1, max: 100 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard', 'mixed'] as Difficulty[],
    },
    additionalInstructions: { type: String, default: '' },
    uploadedFileText: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'] as AssignmentStatus[],
      default: 'pending',
    },
    jobId: { type: String, default: '' },
    resultId: { type: Schema.Types.ObjectId, ref: 'GenerationResult', default: null },
    regenerateCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<AssignmentDocument>('Assignment', AssignmentSchema);
