import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { redisClient } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { GenerationResult } from '../models/GenerationResult';
import { buildPrompt } from '../services/promptBuilder';
import { callLLM } from '../services/llmService';
import { parseResponse } from '../services/responseParser';
import { emitToClient } from '../websocket/wsServer';
import { AssignmentJobData } from '../types';

const CACHE_TTL = 3600; // 1 hour in seconds

async function processGenerationJob(job: Job<AssignmentJobData>): Promise<void> {
  const { assignmentId } = job.data;

  console.log(`[Worker] Processing generation job for assignment: ${assignmentId}`);

  // Step 1: Update status to processing
  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
  await redisClient.set(`assignment:status:${assignmentId}`, 'processing');

  // Step 2: Emit generation started event
  emitToClient(assignmentId, 'generation:started', { assignmentId });

  // Step 3: Build the prompt
  const prompt = buildPrompt(job.data);
  console.log(`[Worker] Prompt built for assignment: ${assignmentId}`);

  // Step 4: Call LLM
  const rawResponse = await callLLM(prompt);
  console.log(`[Worker] LLM response received for assignment: ${assignmentId}`);

  // Step 5: Parse and validate the response
  const parsedResult = parseResponse(rawResponse);
  console.log(`[Worker] Response parsed successfully for assignment: ${assignmentId}`);

  // Step 6: Save the result to MongoDB
  const generationResult = await GenerationResult.create({
    assignmentId,
    sections: parsedResult.sections,
    totalMarks: parsedResult.totalMarks,
    generatedAt: new Date(),
    pdfPath: null,
  });
  console.log(`[Worker] Result saved to MongoDB for assignment: ${assignmentId}`);

  // Step 7: Update the Assignment document
  await Assignment.findByIdAndUpdate(assignmentId, {
    status: 'completed',
    resultId: generationResult._id,
  });

  // Step 8: Update Redis cache
  await redisClient.set(`assignment:status:${assignmentId}`, 'completed');
  await redisClient.set(
    `assignment:result:${assignmentId}`,
    JSON.stringify(generationResult.toObject()),
    'EX',
    CACHE_TTL
  );

  // Step 9: Emit completion event
  emitToClient(assignmentId, 'generation:completed', {
    assignmentId,
    result: generationResult.toObject(),
  });

  console.log(`[Worker] Generation completed for assignment: ${assignmentId}`);
}

export const generationWorker = new Worker<AssignmentJobData>(
  'generation-queue',
  processGenerationJob,
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000, // 5 jobs per minute max
    },
  }
);

// Worker event handlers
generationWorker.on('completed', (job: Job<AssignmentJobData>) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

generationWorker.on('failed', async (job: Job<AssignmentJobData> | undefined, error: Error) => {
  if (!job) {
    console.error('[Worker] Job failed with no job reference:', error.message);
    return;
  }

  const { assignmentId } = job.data;
  console.error(`[Worker] Job ${job.id} failed for assignment ${assignmentId}:`, error.message);

  try {
    // Update assignment status to failed
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });

    // Update Redis cache
    await redisClient.set(`assignment:status:${assignmentId}`, 'failed');

    // Emit failure event
    emitToClient(assignmentId, 'generation:failed', {
      assignmentId,
      error: error.message,
    });
  } catch (updateError) {
    console.error('[Worker] Failed to update status on job failure:', updateError);
  }
});

generationWorker.on('error', (error: Error) => {
  console.error('[Worker] Worker error:', error.message);
});

console.log('✅ BullMQ generation worker started');
