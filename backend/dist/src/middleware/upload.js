"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.extractFileText = extractFileText;
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const ALLOWED_MIMES = ['application/pdf', 'text/plain'];
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errorHandler_1.AppError('Invalid file type. Only PDF and TXT files are allowed.', 400));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
});
async function extractFileText(req, _res, next) {
    try {
        if (!req.file) {
            next();
            return;
        }
        const { mimetype, buffer } = req.file;
        if (mimetype === 'application/pdf') {
            const pdfData = await (0, pdf_parse_1.default)(buffer);
            req.body.uploadedFileText = pdfData.text;
        }
        else if (mimetype === 'text/plain') {
            req.body.uploadedFileText = buffer.toString('utf-8');
        }
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError('Failed to extract text from uploaded file', 400));
    }
}
//# sourceMappingURL=upload.js.map