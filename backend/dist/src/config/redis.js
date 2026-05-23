"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redisClient = new ioredis_1.default({
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});
exports.redisClient.on('connect', () => {
});
exports.redisClient.on('error', (err) => {
});
exports.redisConnection = {
    host: env_1.env.REDIS_HOST,
    port: env_1.env.REDIS_PORT,
};
//# sourceMappingURL=redis.js.map