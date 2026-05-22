import http from 'http';
import { connectDB, disconnectDB } from './src/config/db';
import { redisClient } from './src/config/redis';
import { env } from './src/config/env';
import app from './src/app';
import { initWebSocketServer, closeWebSocketServer } from './src/websocket/wsServer';

// Import worker to start it alongside the server
import './src/queues/worker';

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify Redis connection
    await redisClient.ping();
    console.log('✅ Redis ping successful');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket server
    initWebSocketServer(server);

    // Start listening
    server.listen(env.PORT, () => {
      console.log(`🚀 VedaAI Backend running on port ${env.PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Frontend URL: ${env.FRONTEND_URL}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      // Close HTTP server (stop accepting new connections)
      server.close(() => {
        console.log('HTTP server closed');
      });

      // Close WebSocket server
      await closeWebSocketServer();

      // Close Redis
      await redisClient.quit();
      console.log('Redis connection closed');

      // Disconnect MongoDB
      await disconnectDB();

      console.log('Graceful shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
