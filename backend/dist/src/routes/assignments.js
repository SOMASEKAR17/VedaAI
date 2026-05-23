"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignmentController_1 = require("../controllers/assignmentController");
const upload_1 = require("../middleware/upload");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
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
];
const createAssignmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').transform((v) => v.trim()),
    subject: zod_1.z.string().min(1, 'Subject is required').transform((v) => v.trim()),
    gradeLevel: zod_1.z.string().min(1, 'Grade level is required').transform((v) => v.trim()),
    dueDate: zod_1.z.string().refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date > new Date();
    }, { message: 'Due date must be a valid future date' }),
    questionTypes: zod_1.z.union([
        zod_1.z.array(zod_1.z.enum(ALLOWED_QUESTION_TYPES)).min(1, 'At least one question type is required'),
        zod_1.z.string().transform((val, ctx) => {
            try {
                const parsed = JSON.parse(val);
                const validated = zod_1.z.array(zod_1.z.enum(ALLOWED_QUESTION_TYPES)).min(1).safeParse(parsed);
                if (!validated.success) {
                    ctx.addIssue({
                        code: zod_1.z.ZodIssueCode.custom,
                        message: 'Invalid question types: ' + validated.error.message,
                    });
                    return zod_1.z.NEVER;
                }
                return validated.data;
            }
            catch {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: 'Question types must be a valid JSON array of strings',
                });
                return zod_1.z.NEVER;
            }
        }),
    ]),
    totalQuestions: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(Number)])
        .pipe(zod_1.z.number().int().min(1, 'Minimum 1 question').max(100, 'Maximum 100 questions')),
    totalMarks: zod_1.z.union([zod_1.z.number(), zod_1.z.string().transform(Number)])
        .pipe(zod_1.z.number().int().min(1, 'Minimum 1 mark')),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard', 'mixed']),
    additionalInstructions: zod_1.z.string().optional().default(''),
    uploadedFileText: zod_1.z.string().optional().default(''),
}).refine((data) => {
    const totalQuestions = typeof data.totalQuestions === 'number' ? data.totalQuestions : Number(data.totalQuestions);
    const totalMarks = typeof data.totalMarks === 'number' ? data.totalMarks : Number(data.totalMarks);
    return totalMarks >= totalQuestions;
}, {
    message: 'Total marks must be at least equal to total questions (each question worth at least 1 mark)',
    path: ['totalMarks'],
});
router.post('/', upload_1.upload.single('file'), upload_1.extractFileText, (0, validate_1.validate)(createAssignmentSchema), assignmentController_1.createAssignment);
router.get('/', assignmentController_1.getAllAssignments);
router.get('/:id', assignmentController_1.getAssignmentById);
router.get('/:id/status', assignmentController_1.getAssignmentStatus);
router.delete('/:id', assignmentController_1.deleteAssignment);
router.post('/:id/regenerate', assignmentController_1.regenerateAssignment);
exports.default = router;
//# sourceMappingURL=assignments.js.map