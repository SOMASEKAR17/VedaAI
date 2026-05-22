import mongoose, { Schema, Document } from 'mongoose';
import { IGenerationResult, ISection, IQuestion, QuestionDifficulty } from '../types';

export interface GenerationResultDocument extends Omit<IGenerationResult, '_id'>, Document {}

const QuestionSchema = new Schema<IQuestion>(
  {
    questionNumber: { type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'] as QuestionDifficulty[],
    },
    marks: { type: Number, required: true, min: 1 },
    options: { type: [String], default: [] },
    answer: { type: String, default: '' },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const GenerationResultSchema = new Schema<GenerationResultDocument>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  sections: { type: [SectionSchema], required: true },
  totalMarks: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now },
  pdfPath: { type: String, default: null },
});

export const GenerationResult = mongoose.model<GenerationResultDocument>(
  'GenerationResult',
  GenerationResultSchema
);
