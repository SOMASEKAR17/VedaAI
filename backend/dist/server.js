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
// Import worker to start it alongside the server
require("./src/queues/worker");
async function startServer() {
    try {
        // Connect to MongoDB
        await (0, db_1.connectDB)();
        // Verify Redis connection
        await redis_1.redisClient.ping();
        console.log('✅ Redis ping successful');
        // Create HTTP server
        const server = http_1.default.createServer(app_1.default);
        // Initialize WebSocket server
        (0, wsServer_1.initWebSocketServer)(server);
        // Start listening
        server.listen(env_1.env.PORT, () => {
            console.log(`🚀 VedaAI Backend running on port ${env_1.env.PORT}`);
            console.log(`   Environment: ${env_1.env.NODE_ENV}`);
            console.log(`   Frontend URL: ${env_1.env.FRONTEND_URL}`);
        });
        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            // Close HTTP server (stop accepting new connections)
            server.close(() => {
                console.log('HTTP server closed');
            });
            // Close WebSocket server
            await (0, wsServer_1.closeWebSocketServer)();
            // Close Redis
            await redis_1.redisClient.quit();
            console.log('Redis connection closed');
            // Disconnect MongoDB
            await (0, db_1.disconnectDB)();
            console.log('Graceful shutdown complete');
            process.exit(0);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map