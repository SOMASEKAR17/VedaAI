import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { AssignmentJobData } from '../types';

export const generationQueue = new Queue<AssignmentJobData>('generation-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 50,
    },
  },
});

console.log('✅ BullMQ generation queue initialized');
