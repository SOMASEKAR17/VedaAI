"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Assignment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssignmentSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length > 0,
            message: 'At least one question type is required',
        },
    },
    totalQuestions: { type: Number, required: true, min: 1, max: 100 },
    totalMarks: { type: Number, required: true, min: 1 },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard', 'mixed'],
    },
    additionalInstructions: { type: String, default: '' },
    uploadedFileText: { type: String, default: '' },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    jobId: { type: String, default: '' },
    resultId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'GenerationResult', default: null },
    regenerateCount: { type: Number, default: 0 },
}, {
    timestamps: true,
});
exports.Assignment = mongoose_1.default.model('Assignment', AssignmentSchema);
//# sourceMappingURL=Assignment.js.map