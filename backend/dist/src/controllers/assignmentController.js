"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssignment = createAssignment;
exports.getAllAssignments = getAllAssignments;
exports.getAssignmentById = getAssignmentById;
exports.getAssignmentStatus = getAssignmentStatus;
exports.deleteAssignment = deleteAssignment;
exports.regenerateAssignment = regenerateAssignment;
const Assignment_1 = require("../models/Assignment");
const GenerationResult_1 = require("../models/GenerationResult");
const queue_1 = require("../queues/queue");
const redis_1 = require("../config/redis");
const errorHandler_1 = require("../middleware/errorHandler");
const wsServer_1 = require("../websocket/wsServer");
async function createAssignment(req, res, next) {
    try {
        const { title, subject, gradeLevel, dueDate, questionTypes, totalQuestions, totalMarks, difficulty, additionalInstructions, uploadedFileText, } = req.body;
        // Create the assignment in MongoDB
        const assignment = await Assignment_1.Assignment.create({
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
        });
        // Prepare job data
        const jobData = {
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
        // Push to BullMQ queue
        const job = await queue_1.generationQueue.add('generate-questions', jobData, {
            jobId: `gen-${assignment._id.toString()}`,
        });
        // Update assignment with job ID
        assignment.jobId = job.id || '';
        await assignment.save();
        // Set initial Redis cache
        await redis_1.redisClient.set(`assignment:status:${assignment._id}`, 'pending');
        res.status(201).json({
            success: true,
            assignmentId: assignment._id.toString(),
            jobId: job.id,
            message: 'Assignment created. Generation started.',
        });
    }
    catch (error) {
        next(error);
    }
}
async function getAllAssignments(_req, res, next) {
    try {
        const assignments = await Assignment_1.Assignment.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({
            success: true,
            data: assignments,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getAssignmentById(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findById(id).lean();
        if (!assignment) {
            throw new errorHandler_1.AppError('Assignment not found', 404);
        }
        let result = null;
        if (assignment.status === 'completed' && assignment.resultId) {
            // Check Redis cache first
            const cachedResult = await redis_1.redisClient.get(`assignment:result:${id}`);
            if (cachedResult) {
                result = JSON.parse(cachedResult);
            }
            else {
                result = await GenerationResult_1.GenerationResult.findById(assignment.resultId).lean();
            }
        }
        res.status(200).json({
            success: true,
            data: {
                ...assignment,
                result,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getAssignmentStatus(req, res, next) {
    try {
        const { id } = req.params;
        // Check Redis cache first
        const cachedStatus = await redis_1.redisClient.get(`assignment:status:${id}`);
        if (cachedStatus) {
            res.status(200).json({
                assignmentId: id,
                status: cachedStatus,
                jobId: `gen-${id}`,
            });
            return;
        }
        // Fallback to MongoDB
        const assignment = await Assignment_1.Assignment.findById(id).select('status jobId').lean();
        if (!assignment) {
            throw new errorHandler_1.AppError('Assignment not found', 404);
        }
        res.status(200).json({
            assignmentId: id,
            status: assignment.status,
            jobId: assignment.jobId,
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findByIdAndDelete(id);
        if (!assignment) {
            throw new errorHandler_1.AppError('Assignment not found', 404);
        }
        if (assignment.resultId) {
            await GenerationResult_1.GenerationResult.findByIdAndDelete(assignment.resultId);
        }
        await redis_1.redisClient.del(`assignment:status:${id}`);
        await redis_1.redisClient.del(`assignment:result:${id}`);
        res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
async function regenerateAssignment(req, res, next) {
    try {
        const { id } = req.params;
        const assignment = await Assignment_1.Assignment.findById(id);
        if (!assignment) {
            throw new errorHandler_1.AppError('Assignment not found', 404);
        }
        // Extract previous questions from the existing result, preserving the history in DB
        let previousQuestions = [];
        if (assignment.resultId) {
            const prevResult = await GenerationResult_1.GenerationResult.findById(assignment.resultId);
            if (prevResult) {
                previousQuestions = prevResult.sections.flatMap((s) => s.questions.map((q) => q.text));
            }
            assignment.resultId = null;
        }
        // Reset status to pending
        assignment.status = 'pending';
        await assignment.save();
        // Prepare job data
        const jobData = {
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
        // Push new job to BullMQ queue
        const job = await queue_1.generationQueue.add('generate-questions', jobData, {
            jobId: `gen-${assignment._id.toString()}-${Date.now()}`,
        });
        // Update assignment with new job ID
        assignment.jobId = job.id || '';
        await assignment.save();
        // Reset Redis status cache
        await redis_1.redisClient.set(`assignment:status:${assignment._id}`, 'pending');
        await redis_1.redisClient.del(`assignment:result:${assignment._id}`);
        // Emit event so WS clients know immediately
        (0, wsServer_1.emitToClient)(assignment._id.toString(), 'generation:started', { assignmentId: assignment._id.toString() });
        res.status(200).json({
            success: true,
            message: 'Regeneration started successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=assignmentController.js.map