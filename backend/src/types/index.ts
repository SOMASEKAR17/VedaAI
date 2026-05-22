import { Types } from 'mongoose';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type QuestionType =
  | 'Multiple Choice Questions'
  | 'Short Questions'
  | 'Diagram/Graph-Based Questions'
  | 'Numerical Problems'
  | 'Long Answer Questions'
  | 'True / False Questions'
  | 'Fill in the Blanks'
  | 'MCQ'
  | 'Short Answer'
  | 'Long Answer';

export interface IQuestion {
  questionNumber: number;
  text: string;
  type: string;
  difficulty: QuestionDifficulty;
  marks: number;
  options: string[];
  answer: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IAssignment {
  _id: Types.ObjectId;
  title: string;
  subject: string;
  gradeLevel: string;
  dueDate: Date;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: Difficulty;
  additionalInstructions: string;
  uploadedFileText: string;
  status: AssignmentStatus;
  jobId: string;
  resultId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGenerationResult {
  _id: Types.ObjectId;
  assignmentId: Types.ObjectId;
  sections: ISection[];
  totalMarks: number;
  generatedAt: Date;
  pdfPath: string | null;
}

export interface ParsedResult {
  sections: ISection[];
  totalMarks: number;
}

export interface WSMessage {
  type: string;
  assignmentId?: string;
  [key: string]: unknown;
}

export interface WSEvent {
  event: string;
  payload: Record<string, unknown>;
}

export interface AssignmentJobData {
  assignmentId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  difficulty: Difficulty;
  additionalInstructions: string;
  uploadedFileText: string;
  previousQuestions?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}
