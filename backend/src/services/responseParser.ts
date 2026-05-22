import { z } from 'zod';
import { ParsedResult, ISection } from '../types';

const QuestionSchema = z.object({
  questionNumber: z.preprocess(
    (val) => {
      const num = Number(val);
      return isNaN(num) ? val : Math.round(num);
    },
    z.number().int().positive('Question number must be a positive integer')
  ),
  text: z.string().min(1, 'Question text is required'),
  type: z.string().min(1, 'Question type is required'),
  difficulty: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const lower = val.toLowerCase().trim();
        if (['easy', 'medium', 'hard'].includes(lower)) return lower;
      }
      return 'medium';
    },
    z.enum(['easy', 'medium', 'hard'])
  ),
  marks: z.preprocess(
    (val) => {
      const num = Number(val);
      return isNaN(num) ? val : Math.max(1, Math.round(num));
    },
    z.number().int().positive('Marks must be a positive integer')
  ),
  options: z.preprocess(
    (val) => (Array.isArray(val) ? val.map((item) => String(item)) : []),
    z.array(z.string())
  ).default([]),
  answer: z.preprocess(
    (val) => String(val ?? ''),
    z.string().default('')
  ),
});

const SectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  instruction: z.string().min(1, 'Section instruction is required'),
  questions: z.array(QuestionSchema).min(1, 'Each section must have at least one question'),
});

const GenerationResultSchema = z.object({
  sections: z.array(SectionSchema).min(1, 'At least one section is required'),
});

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
    Object.setPrototypeOf(this, ParseError.prototype);
  }
}

export function parseResponse(raw: string): ParsedResult {
  // Strip any accidental markdown backticks or code fences
  let cleaned = raw.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Remove leading/trailing whitespace again after stripping
  cleaned = cleaned.trim();

  // Attempt JSON parse
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new ParseError(
      `Failed to parse LLM response as JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}. Raw response starts with: "${cleaned.substring(0, 200)}..."`
    );
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
  const totalMarks = validatedData.sections.reduce((sum: number, section: ISection) => {
    return sum + section.questions.reduce((qSum, q) => qSum + q.marks, 0);
  }, 0);

  return {
    sections: validatedData.sections,
    totalMarks,
  };
}
