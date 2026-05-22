"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResultByAssignmentId = getResultByAssignmentId;
exports.generateResultPDF = generateResultPDF;
const GenerationResult_1 = require("../models/GenerationResult");
const redis_1 = require("../config/redis");
const pdfService_1 = require("../services/pdfService");
const errorHandler_1 = require("../middleware/errorHandler");
async function getResultByAssignmentId(req, res, next) {
    try {
        const { assignmentId } = req.params;
        // Check Redis cache first
        const cachedResult = await redis_1.redisClient.get(`assignment:result:${assignmentId}`);
        if (cachedResult) {
            res.status(200).json({
                success: true,
                data: JSON.parse(cachedResult),
            });
            return;
        }
        // Fallback to MongoDB
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
        const result = await GenerationResult_1.GenerationResult.findOne({ assignmentId }).lean();
        if (!result) {
            throw new errorHandler_1.AppError('Result not found for this assignment', 404);
        }
        // Cast to IGenerationResult for the PDF service
        const resultData = result;
        const pdfPath = await (0, pdfService_1.generatePDF)(resultData, withAnswerKey);
        // Update the result with PDF path if generated without key
        if (!withAnswerKey) {
            await GenerationResult_1.GenerationResult.findByIdAndUpdate(result._id, { pdfPath });
        }
        const filename = `assignment-${assignmentId}${withAnswerKey ? '-key' : ''}.pdf`;
        // Send the PDF file as a download
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