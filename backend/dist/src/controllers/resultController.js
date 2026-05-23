"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResultByAssignmentId = getResultByAssignmentId;
exports.generateResultPDF = generateResultPDF;
const Assignment_1 = require("../models/Assignment");
const GenerationResult_1 = require("../models/GenerationResult");
const redis_1 = require("../config/redis");
const pdfService_1 = require("../services/pdfService");
const errorHandler_1 = require("../middleware/errorHandler");
async function getResultByAssignmentId(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const cachedResult = await redis_1.redisClient.get(`assignment:result:${assignmentId}`);
        if (cachedResult) {
            res.status(200).json({
                success: true,
                data: JSON.parse(cachedResult),
            });
            return;
        }
        const result = await GenerationResult_1.GenerationResult.findOne({ assignmentId }).lean();
        if (!result) {
            throw new errorHandler_1.AppError('Result not found for this assignment', 404);
        }
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function generateResultPDF(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const withAnswerKey = req.body.withAnswerKey === true || req.query.withAnswerKey === 'true';
        const keptQuestionNumbers = req.body.keptQuestionNumbers;
        const assignment = await Assignment_1.Assignment.findById(assignmentId).lean();
        if (!assignment) {
            throw new errorHandler_1.AppError('Assignment not found', 404);
        }
        const currentCount = assignment.regenerateCount || 0;
        const result = await GenerationResult_1.GenerationResult.findOne({ assignmentId }).lean();
        if (!result) {
            throw new errorHandler_1.AppError('Result not found for this assignment', 404);
        }
        let resultData = result;
        let suffix = '';
        if (Array.isArray(keptQuestionNumbers)) {
            suffix = '-custom';
            const filteredSections = result.sections.map((section) => {
                const filteredQuestions = section.questions.filter((q) => keptQuestionNumbers.includes(q.questionNumber));
                return {
                    ...section,
                    questions: filteredQuestions,
                };
            }).filter((section) => section.questions.length > 0);
            resultData = {
                ...result,
                sections: filteredSections,
            };
        }
        else {
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
            };
        }
        const pdfPath = await (0, pdfService_1.generatePDF)(resultData, assignment, withAnswerKey, suffix);
        if (!withAnswerKey && !suffix) {
            await GenerationResult_1.GenerationResult.findByIdAndUpdate(result._id, { pdfPath });
        }
        const filename = `assignment-${assignmentId}${withAnswerKey ? '-key' : ''}${suffix}.pdf`;
        res.download(pdfPath, filename, (err) => {
            if (err) {
                next(new errorHandler_1.AppError('Failed to send PDF file', 500));
            }
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=resultController.js.map