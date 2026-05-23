"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.statusCode,
        });
        return;
    }
    if (err.message && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
            success: false,
            error: 'File size exceeds the maximum allowed limit',
            code: 400,
        });
        return;
    }
    if (err.message && err.message.includes('Invalid file type')) {
        res.status(400).json({
            success: false,
            error: err.message,
            code: 400,
        });
        return;
    }
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: err.message,
            code: 400,
        });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            error: 'Invalid ID format',
            code: 400,
        });
        return;
    }
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        code: 500,
    });
}
//# sourceMappingURL=errorHandler.js.map