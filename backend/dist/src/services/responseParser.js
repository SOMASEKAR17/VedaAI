"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
exports.parseResponse = parseResponse;
const zod_1 = require("zod");
const QuestionSchema = zod_1.z.object({
    questionNumber: zod_1.z.preprocess((val) => {
        const num = Number(val);
        return isNaN(num) ? val : Math.round(num);
    }, zod_1.z.number().int().positive('Question number must be a positive integer')),
    text: zod_1.z.string().min(1, 'Question text is required'),
    type: zod_1.z.string().min(1, 'Question type is required'),
    difficulty: zod_1.z.preprocess((val) => {
        if (typeof val === 'string') {
            const lower = val.toLowerCase().trim();
            if (['easy', 'medium', 'hard'].includes(lower))
                return lower;
        }
        return 'medium';
    }, zod_1.z.enum(['easy', 'medium', 'hard'])),
    marks: zod_1.z.preprocess((val) => {
        const num = Number(val);
        return isNaN(num) ? val : Math.max(1, Math.round(num));
    }, zod_1.z.number().int().positive('Marks must be a positive integer')),
    options: zod_1.z.preprocess((val) => (Array.isArray(val) ? val.map((item) => String(item)) : []), zod_1.z.array(zod_1.z.string())).default([]),
    answer: zod_1.z.preprocess((val) => String(val ?? ''), zod_1.z.string().default('')),
});
const SectionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Section title is required'),
    instruction: zod_1.z.string().min(1, 'Section instruction is required'),
    questions: zod_1.z.array(QuestionSchema).min(1, 'Each section must have at least one question'),
});
const GenerationResultSchema = zod_1.z.object({
    sections: zod_1.z.array(SectionSchema).min(1, 'At least one section is required'),
});
class ParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParseError';
        Object.setPrototypeOf(this, ParseError.prototype);
    }
}
exports.ParseError = ParseError;
function parseResponse(raw) {
    // Strip any accidental markdown backticks or code fences
    let cleaned = raw.trim();
    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }
    // Remove leading/trailing whitespace again after stripping
    cleaned = cleaned.trim();
    // Attempt JSON parse
    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    }
    catch (error) {
        throw new ParseError(`Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}. Raw response starts with: "${cleaned.substring(0, 200)}..."`);
    }
    // Validate against schema
    const validation = GenerationResultSchema.safeParse(parsed);
    if (!validation.success) {
        const issues = validation.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join('; ');
        throw new ParseError(`LLM response validation failed: ${issues}`);
    }
    const validatedData = validation.data;
    // Compute total marks
    const totalMarks = validatedData.sections.reduce((sum, section) => {
        return sum + section.questions.reduce((qSum, q) => qSum + q.marks, 0);
    }, 0);
    return {
        sections: validatedData.sections,
        totalMarks,
    };
}
//# sourceMappingURL=responseParser.js.map