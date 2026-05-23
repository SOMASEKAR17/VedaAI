"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generationWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const redis_2 = require("../config/redis");
const Assignment_1 = require("../models/Assignment");
const GenerationResult_1 = require("../models/GenerationResult");
const promptBuilder_1 = require("../services/promptBuilder");
const llmService_1 = require("../services/llmService");
const responseParser_1 = require("../services/responseParser");
const wsServer_1 = require("../websocket/wsServer");
const CACHE_TTL = 3600;
async function processGenerationJob(job) {
    const { assignmentId } = job.data;
    await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'processing');
    (0, wsServer_1.emitToClient)(assignmentId, 'generation:started', { assignmentId });
    const prompt = (0, promptBuilder_1.buildPrompt)(job.data);
    const rawResponse = await (0, llmService_1.callLLM)(prompt);
    const parsedResult = (0, responseParser_1.parseResponse)(rawResponse);
    const assignmentObj = await Assignment_1.Assignment.findById(assignmentId);
    const currentRegenRound = assignmentObj ? (assignmentObj.regenerateCount || 0) : 0;
    let generationResult = await GenerationResult_1.GenerationResult.findOne({ assignmentId });
    if (generationResult) {
        const sections = generationResult.sections;
        let totalExistingQuestions = 0;
        for (const s of sections) {
            totalExistingQuestions += s.questions.length;
        }
        let nextQuestionNumber = totalExistingQuestions + 1;
        for (const newSec of parsedResult.sections) {
            const matchingSec = sections.find((s) => s.title.toLowerCase().trim() === newSec.title.toLowerCase().trim());
            if (matchingSec) {
                for (const q of newSec.questions) {
                    matchingSec.questions.push({
                        questionNumber: nextQuestionNumber++,
                        text: q.text,
                        type: q.type,
                        difficulty: q.difficulty,
                        marks: q.marks,
                        options: q.options || [],
                        answer: q.answer || '',
                        regenerateRound: currentRegenRound,
                    });
                }
            }
            else {
                const questionsWithCorrectNumbers = newSec.questions.map((q) => ({
                    questionNumber: nextQuestionNumber++,
                    text: q.text,
                    type: q.type,
                    difficulty: q.difficulty,
                    marks: q.marks,
                    options: q.options || [],
                    answer: q.answer || '',
                    regenerateRound: currentRegenRound,
                }));
                sections.push({
                    title: newSec.title,
                    instruction: newSec.instruction,
                    questions: questionsWithCorrectNumbers,
                });
            }
        }
        generationResult.sections = sections;
        let newTotalMarks = 0;
        for (const s of sections) {
            for (const q of s.questions) {
                newTotalMarks += q.marks;
            }
        }
        generationResult.totalMarks = newTotalMarks;
        generationResult.generatedAt = new Date();
        generationResult.pdfPath = null;
        await generationResult.save();
    }
    else {
        generationResult = await GenerationResult_1.GenerationResult.create({
            assignmentId,
            sections: parsedResult.sections.map((sec) => ({
                title: sec.title,
                instruction: sec.instruction,
                questions: sec.questions.map((q) => ({
                    questionNumber: q.questionNumber,
                    text: q.text,
                    type: q.type,
                    difficulty: q.difficulty,
                    marks: q.marks,
                    options: q.options || [],
                    answer: q.answer || '',
                    regenerateRound: currentRegenRound,
                })),
            })),
            totalMarks: parsedResult.totalMarks,
            generatedAt: new Date(),
            pdfPath: null,
        });
    }
    let totalQuestionsCount = 0;
    let totalMarksSum = 0;
    for (const s of generationResult.sections) {
        totalQuestionsCount += s.questions.length;
        for (const q of s.questions) {
            totalMarksSum += q.marks;
        }
    }
    await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        resultId: generationResult._id,
        totalQuestions: totalQuestionsCount,
        totalMarks: totalMarksSum,
    });
    await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'completed');
    await redis_2.redisClient.set(`assignment:result:${assignmentId}`, JSON.stringify(generationResult.toObject()), 'EX', CACHE_TTL);
    (0, wsServer_1.emitToClient)(assignmentId, 'generation:completed', {
        assignmentId,
        result: generationResult.toObject(),
    });
}
exports.generationWorker = new bullmq_1.Worker('generation-queue', processGenerationJob, {
    connection: redis_1.redisConnection,
    concurrency: 2,
    limiter: {
        max: 5,
        duration: 60000,
    },
});
exports.generationWorker.on('completed', (_job) => {
});
exports.generationWorker.on('failed', async (job, error) => {
    if (!job) {
        return;
    }
    const { assignmentId } = job.data;
    try {
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'failed');
        (0, wsServer_1.emitToClient)(assignmentId, 'generation:failed', {
            assignmentId,
            error: error.message,
        });
    }
    catch (updateError) {
    }
});
exports.generationWorker.on('error', (error) => {
});
//# sourceMappingURL=worker.js.map