import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import assignmentRoutes from './routes/assignments';
import resultRoutes from './routes/results';

const app = express();

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'VedaAI Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/results', resultRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
