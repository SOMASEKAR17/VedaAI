import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment';
import { GenerationResult } from '../models/GenerationResult';
import { redisClient } from '../config/redis';
import { generatePDF } from '../services/pdfService';
import { AppError } from '../middleware/errorHandler';
import { IGenerationResult } from '../types';

export async function getResultByAssignmentId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { assignmentId } = req.params;

    const cachedResult = await redisClient.get(`assignment:result:${assignmentId}`);
    if (cachedResult) {
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedResult),
      });
      return;
    }

    const result = await GenerationResult.findOne({ assignmentId }).lean();
    if (!result) {
      throw new AppError('Result not found for this assignment', 404);
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function generateResultPDF(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const withAnswerKey = req.body.withAnswerKey === true || req.query.withAnswerKey === 'true';
    const keptQuestionNumbers = req.body.keptQuestionNumbers;

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    const currentCount = assignment.regenerateCount || 0;

    const result = await GenerationResult.findOne({ assignmentId }).lean();
    if (!result) {
      throw new AppError('Result not found for this assignment', 404);
    }

    let resultData = result as unknown as IGenerationResult;
    let suffix = '';

    if (Array.isArray(keptQuestionNumbers)) {
      suffix = '-custom';
      const filteredSections = result.sections.map((section) => {
        const filteredQuestions = section.questions.filter((q) =>
          keptQuestionNumbers.includes(q.questionNumber)
        );
        return {
          ...section,
          questions: filteredQuestions,
        };
      }).filter((section) => section.questions.length > 0);

      resultData = {
        ...result,
        sections: filteredSections,
      } as unknown as IGenerationResult;
    } else {
      let nextNum = 1;
      const filteredSections = result.sections.map((section) => {
        const filteredQuestions = section.questions
          .filter((q) => (q.regenerateRound ?? 0) === currentCount)
          .map((q) => ({
            ...q,
            questionNumber: nextNum++,
          }));
        return {
          ...section,
          questions: filteredQuestions,
        };
      }).filter((section) => section.questions.length > 0);

      resultData = {
        ...result,
        sections: filteredSections,
      } as unknown as IGenerationResult;
    }

    const pdfPath = await generatePDF(resultData, assignment, withAnswerKey, suffix);

    if (!withAnswerKey && !suffix) {
      await GenerationResult.findByIdAndUpdate(result._id, { pdfPath });
    }

    const filename = `assignment-${assignmentId}${withAnswerKey ? '-key' : ''}${suffix}.pdf`;

    res.download(pdfPath, filename, (err) => {
      if (err) {
        next(new AppError('Failed to send PDF file', 500));
      }
    });
  } catch (error) {
    next(error);
  }
}
