import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment';
import { GenerationResult } from '../models/GenerationResult';
import { generationQueue } from '../queues/queue';
import { redisClient } from '../config/redis';
import { AppError } from '../middleware/errorHandler';
import { AssignmentJobData } from '../types';
import { emitToClient } from '../websocket/wsServer';

export async function createAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      title,
      subject,
      gradeLevel,
      dueDate,
      questionTypes,
      totalQuestions,
      totalMarks,
      difficulty,
      additionalInstructions,
      uploadedFileText,
    } = req.body;

    const assignment = await Assignment.create({
      title,
      subject,
      gradeLevel,
      dueDate: new Date(dueDate),
      questionTypes: typeof questionTypes === 'string' ? JSON.parse(questionTypes) : questionTypes,
      totalQuestions: Number(totalQuestions),
      totalMarks: Number(totalMarks),
      difficulty,
      additionalInstructions: additionalInstructions || '',
      uploadedFileText: uploadedFileText || '',
      status: 'pending',
      resultId: null,
      regenerateCount: 0,
    });

    const jobData: AssignmentJobData = {
      assignmentId: assignment._id.toString(),
      title: assignment.title,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      questionTypes: assignment.questionTypes,
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty,
      additionalInstructions: assignment.additionalInstructions,
      uploadedFileText: assignment.uploadedFileText,
    };

    const job = await generationQueue.add('generate-questions', jobData, {
      jobId: `gen-${assignment._id.toString()}`,
    });

    assignment.jobId = job.id || '';
    await assignment.save();

    await redisClient.set(`assignment:status:${assignment._id}`, 'pending');

    res.status(201).json({
      success: true,
      assignmentId: assignment._id.toString(),
      jobId: job.id,
      message: 'Assignment created. Generation started.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllAssignments(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignmentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    let result = null;
    if (assignment.status === 'completed' && assignment.resultId) {
      const cachedResult = await redisClient.get(`assignment:result:${id}`);
      if (cachedResult) {
        result = JSON.parse(cachedResult);
      } else {
        result = await GenerationResult.findById(assignment.resultId).lean();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...assignment,
        result,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignmentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const cachedStatus = await redisClient.get(`assignment:status:${id}`);
    if (cachedStatus) {
      res.status(200).json({
        assignmentId: id,
        status: cachedStatus,
        jobId: `gen-${id}`,
      });
      return;
    }

    const assignment = await Assignment.findById(id).select('status jobId').lean();
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    res.status(200).json({
      assignmentId: id,
      status: assignment.status,
      jobId: assignment.jobId,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }
    if (assignment.resultId) {
      await GenerationResult.findByIdAndDelete(assignment.resultId);
    }
    await redisClient.del(`assignment:status:${id}`);
    await redisClient.del(`assignment:result:${id}`);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function regenerateAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    if ((assignment.regenerateCount || 0) >= 5) {
      throw new AppError('Maximum cap of 5 regenerations reached for this assignment', 400);
    }

    let previousQuestions: string[] = [];
    if (assignment.resultId) {
      const prevResult = await GenerationResult.findById(assignment.resultId);
      if (prevResult) {
        previousQuestions = prevResult.sections.flatMap((s) =>
          s.questions.map((q) => q.text)
        );
      }
    }

    assignment.regenerateCount = (assignment.regenerateCount || 0) + 1;
    assignment.status = 'pending';
    await assignment.save();

    const jobData: AssignmentJobData = {
      assignmentId: assignment._id.toString(),
      title: assignment.title,
      subject: assignment.subject,
      gradeLevel: assignment.gradeLevel,
      questionTypes: assignment.questionTypes,
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
      difficulty: assignment.difficulty,
      additionalInstructions: assignment.additionalInstructions,
      uploadedFileText: assignment.uploadedFileText,
      previousQuestions,
    };

    const job = await generationQueue.add('generate-questions', jobData, {
      jobId: `gen-${assignment._id.toString()}-${Date.now()}`,
    });

    assignment.jobId = job.id || '';
    await assignment.save();

    await redisClient.set(`assignment:status:${assignment._id}`, 'pending');
    await redisClient.del(`assignment:result:${assignment._id}`);

    emitToClient(assignment._id.toString(), 'generation:started', { assignmentId: assignment._id.toString() });

    res.status(200).json({
      success: true,
      message: 'Regeneration started successfully',
    });
  } catch (error) {
    next(error);
  }
}
