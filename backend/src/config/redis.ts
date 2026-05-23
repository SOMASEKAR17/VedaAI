import Redis from 'ioredis';
import { env } from './env';

export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on('connect', () => {

});

redisClient.on('error', (err) => {

});

export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
