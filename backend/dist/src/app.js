"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const assignments_1 = __importDefault(require("./routes/assignments"));
const results_1 = __importDefault(require("./routes/results"));
const app = (0, express_1.default)();
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
// Health check
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'VedaAI Backend is running',
        timestamp: new Date().toISOString(),
    });
});
// Routes
app.use('/api/assignments', assignments_1.default);
app.use('/api/results', results_1.default);
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map