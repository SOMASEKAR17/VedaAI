"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const db_1 = require("./src/config/db");
const redis_1 = require("./src/config/redis");
const env_1 = require("./src/config/env");
const app_1 = __importDefault(require("./src/app"));
const wsServer_1 = require("./src/websocket/wsServer");
require("./src/queues/worker");
async function startServer() {
    try {
        await (0, db_1.connectDB)();
        await redis_1.redisClient.ping();
        const server = http_1.default.createServer(app_1.default);
        (0, wsServer_1.initWebSocketServer)(server);
        server.listen(env_1.env.PORT, () => {
        });
        const gracefulShutdown = async (signal) => {
            server.close(() => {
            });
            await (0, wsServer_1.closeWebSocketServer)();
            await redis_1.redisClient.quit();
            await (0, db_1.disconnectDB)();
            process.exit(0);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map