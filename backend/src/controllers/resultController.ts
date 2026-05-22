import { Request, Response, NextFunction } from 'express';
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

    // Check Redis cache first
    const cachedResult = await redisClient.get(`assignment:result:${assignmentId}`);
    if (cachedResult) {
      res.status(200).json({
        success: true,
        data: JSON.parse(cachedResult),
      });
      return;
    }

    // Fallback to MongoDB
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

    const result = await GenerationResult.findOne({ assignmentId }).lean();
    if (!result) {
      throw new AppError('Result not found for this assignment', 404);
    }

    // Cast to IGenerationResult for the PDF service
    const resultData = result as unknown as IGenerationResult;

    const pdfPath = await generatePDF(resultData, withAnswerKey);

    // Update the result with PDF path if generated without key
    if (!withAnswerKey) {
      await GenerationResult.findByIdAndUpdate(result._id, { pdfPath });
    }

    const filename = `assignment-${assignmentId}${withAnswerKey ? '-key' : ''}.pdf`;

    // Send the PDF file as a download
    res.download(pdfPath, filename, (err) => {
      if (err) {
        next(new AppError('Failed to send PDF file', 500));
      }
    });
  } catch (error) {
    next(error);
  }
}
