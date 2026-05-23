import http from 'http';
import { connectDB, disconnectDB } from './src/config/db';
import { redisClient } from './src/config/redis';
import { env } from './src/config/env';
import app from './src/app';
import { initWebSocketServer, closeWebSocketServer } from './src/websocket/wsServer';

import './src/queues/worker';

async function startServer(): Promise<void> {
  try {
    await connectDB();

    await redisClient.ping();

    const server = http.createServer(app);

    initWebSocketServer(server);

    server.listen(env.PORT, () => {
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {


      server.close(() => {
      });

      await closeWebSocketServer();

      await redisClient.quit();

      await disconnectDB();


      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {

    process.exit(1);
  }
}

startServer();
