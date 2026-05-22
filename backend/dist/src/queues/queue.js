"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.generationQueue = new bullmq_1.Queue('generation-queue', {
    connection: redis_1.redisConnection,
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
//# sourceMappingURL=queue.js.map