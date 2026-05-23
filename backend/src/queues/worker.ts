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

const CACHE_TTL = 3600;

async function processGenerationJob(job: Job<AssignmentJobData>): Promise<void> {
  const { assignmentId } = job.data;



  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
  await redisClient.set(`assignment:status:${assignmentId}`, 'processing');

  emitToClient(assignmentId, 'generation:started', { assignmentId });

  const prompt = buildPrompt(job.data);

  const rawResponse = await callLLM(prompt);

  const parsedResult = parseResponse(rawResponse);

  const assignmentObj = await Assignment.findById(assignmentId);
  const currentRegenRound = assignmentObj ? (assignmentObj.regenerateCount || 0) : 0;

  let generationResult = await GenerationResult.findOne({ assignmentId });

  if (generationResult) {
    const sections = generationResult.sections;
    let totalExistingQuestions = 0;
    for (const s of sections) {
      totalExistingQuestions += s.questions.length;
    }

    let nextQuestionNumber = totalExistingQuestions + 1;

    for (const newSec of parsedResult.sections) {
      const matchingSec = sections.find(
        (s: any) => s.title.toLowerCase().trim() === newSec.title.toLowerCase().trim()
      );

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
      } else {
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
  } else {
    generationResult = await GenerationResult.create({
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

  await Assignment.findByIdAndUpdate(assignmentId, {
    status: 'completed',
    resultId: generationResult._id,
    totalQuestions: totalQuestionsCount,
    totalMarks: totalMarksSum,
  });

  await redisClient.set(`assignment:status:${assignmentId}`, 'completed');
  await redisClient.set(
    `assignment:result:${assignmentId}`,
    JSON.stringify(generationResult.toObject()),
    'EX',
    CACHE_TTL
  );

  emitToClient(assignmentId, 'generation:completed', {
    assignmentId,
    result: generationResult.toObject(),
  });


}

export const generationWorker = new Worker<AssignmentJobData>(
  'generation-queue',
  processGenerationJob,
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 60000,
    },
  }
);

generationWorker.on('completed', (_job: Job<AssignmentJobData>) => {
});

generationWorker.on('failed', async (job: Job<AssignmentJobData> | undefined, error: Error) => {
  if (!job) {

    return;
  }

  const { assignmentId } = job.data;


  try {
    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });

    await redisClient.set(`assignment:status:${assignmentId}`, 'failed');

    emitToClient(assignmentId, 'generation:failed', {
      assignmentId,
      error: error.message,
    });
  } catch (updateError) {

  }
});

generationWorker.on('error', (error: Error) => {

});


