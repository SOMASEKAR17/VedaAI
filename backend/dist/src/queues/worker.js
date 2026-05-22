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
const CACHE_TTL = 3600; // 1 hour in seconds
async function processGenerationJob(job) {
    const { assignmentId } = job.data;
    console.log(`[Worker] Processing generation job for assignment: ${assignmentId}`);
    // Step 1: Update status to processing
    await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'processing');
    // Step 2: Emit generation started event
    (0, wsServer_1.emitToClient)(assignmentId, 'generation:started', { assignmentId });
    // Step 3: Build the prompt
    const prompt = (0, promptBuilder_1.buildPrompt)(job.data);
    console.log(`[Worker] Prompt built for assignment: ${assignmentId}`);
    // Step 4: Call LLM
    const rawResponse = await (0, llmService_1.callLLM)(prompt);
    console.log(`[Worker] LLM response received for assignment: ${assignmentId}`);
    // Step 5: Parse and validate the response
    const parsedResult = (0, responseParser_1.parseResponse)(rawResponse);
    console.log(`[Worker] Response parsed successfully for assignment: ${assignmentId}`);
    // Step 6: Save the result to MongoDB
    const generationResult = await GenerationResult_1.GenerationResult.create({
        assignmentId,
        sections: parsedResult.sections,
        totalMarks: parsedResult.totalMarks,
        generatedAt: new Date(),
        pdfPath: null,
    });
    console.log(`[Worker] Result saved to MongoDB for assignment: ${assignmentId}`);
    // Step 7: Update the Assignment document
    await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        resultId: generationResult._id,
    });
    // Step 8: Update Redis cache
    await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'completed');
    await redis_2.redisClient.set(`assignment:result:${assignmentId}`, JSON.stringify(generationResult.toObject()), 'EX', CACHE_TTL);
    // Step 9: Emit completion event
    (0, wsServer_1.emitToClient)(assignmentId, 'generation:completed', {
        assignmentId,
        result: generationResult.toObject(),
    });
    console.log(`[Worker] Generation completed for assignment: ${assignmentId}`);
}
exports.generationWorker = new bullmq_1.Worker('generation-queue', processGenerationJob, {
    connection: redis_1.redisConnection,
    concurrency: 2,
    limiter: {
        max: 5,
        duration: 60000, // 5 jobs per minute max
    },
});
// Worker event handlers
exports.generationWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
});
exports.generationWorker.on('failed', async (job, error) => {
    if (!job) {
        console.error('[Worker] Job failed with no job reference:', error.message);
        return;
    }
    const { assignmentId } = job.data;
    console.error(`[Worker] Job ${job.id} failed for assignment ${assignmentId}:`, error.message);
    try {
        // Update assignment status to failed
        await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        // Update Redis cache
        await redis_2.redisClient.set(`assignment:status:${assignmentId}`, 'failed');
        // Emit failure event
        (0, wsServer_1.emitToClient)(assignmentId, 'generation:failed', {
            assignmentId,
            error: error.message,
        });
    }
    catch (updateError) {
        console.error('[Worker] Failed to update status on job failure:', updateError);
    }
});
exports.generationWorker.on('error', (error) => {
    console.error('[Worker] Worker error:', error.message);
});
console.log('✅ BullMQ generation worker started');
//# sourceMappingURL=worker.js.map