import { Router } from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  getAssignmentStatus,
  deleteAssignment,
  regenerateAssignment,
} from '../controllers/assignmentController';
import { upload, extractFileText } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const ALLOWED_QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'True / False Questions',
  'Fill in the Blanks',
  'MCQ',
  'Short Answer',
  'Long Answer',
] as const;

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').transform((v) => v.trim()),
  subject: z.string().min(1, 'Subject is required').transform((v) => v.trim()),
  gradeLevel: z.string().min(1, 'Grade level is required').transform((v) => v.trim()),
  dueDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    },
    { message: 'Due date must be a valid future date' }
  ),
  questionTypes: z.union([
    z.array(z.enum(ALLOWED_QUESTION_TYPES)).min(1, 'At least one question type is required'),
    z.string().transform((val, ctx) => {
      try {
        const parsed = JSON.parse(val);
        const validated = z.array(z.enum(ALLOWED_QUESTION_TYPES)).min(1).safeParse(parsed);
        if (!validated.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid question types: ' + validated.error.message,
          });
          return z.NEVER;
        }
        return validated.data;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Question types must be a valid JSON array of strings',
        });
        return z.NEVER;
      }
    }),
  ]),
  totalQuestions: z.union([z.number(), z.string().transform(Number)])
    .pipe(z.number().int().min(1, 'Minimum 1 question').max(100, 'Maximum 100 questions')),
  totalMarks: z.union([z.number(), z.string().transform(Number)])
    .pipe(z.number().int().min(1, 'Minimum 1 mark')),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  additionalInstructions: z.string().optional().default(''),
  uploadedFileText: z.string().optional().default(''),
}).refine(
  (data) => {
    const totalQuestions = typeof data.totalQuestions === 'number' ? data.totalQuestions : Number(data.totalQuestions);
    const totalMarks = typeof data.totalMarks === 'number' ? data.totalMarks : Number(data.totalMarks);
    return totalMarks >= totalQuestions;
  },
  {
    message: 'Total marks must be at least equal to total questions (each question worth at least 1 mark)',
    path: ['totalMarks'],
  }
);

router.post(
  '/',
  upload.single('file'),
  extractFileText,
  validate(createAssignmentSchema),
  createAssignment
);

router.get('/', getAllAssignments);

router.get('/:id', getAssignmentById);

router.get('/:id/status', getAssignmentStatus);

router.delete('/:id', deleteAssignment);

router.post('/:id/regenerate', regenerateAssignment);

export default router;
