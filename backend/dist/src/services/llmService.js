"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMServiceError = void 0;
exports.callLLM = callLLM;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const env_1 = require("../config/env");
const groq = new groq_sdk_1.default({
    apiKey: env_1.env.GROQ_API_KEY,
});
class LLMServiceError extends Error {
    statusCode;
    isRetryable;
    constructor(message, statusCode, isRetryable = false) {
        super(message);
        this.name = 'LLMServiceError';
        this.statusCode = statusCode;
        this.isRetryable = isRetryable;
        Object.setPrototypeOf(this, LLMServiceError.prototype);
    }
}
exports.LLMServiceError = LLMServiceError;
async function callLLM(prompt) {
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a JSON-only response generator. You must return ONLY valid JSON with no additional text, markdown formatting, or explanation. Never wrap your response in backticks or code blocks.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0,
            max_tokens: 8192,
            response_format: {
                type: 'json_object',
            },
        });
        const text = response.choices[0]?.message?.content;
        if (!text) {
            throw new LLMServiceError('No text content in LLM response');
        }
        return text;
    }
    catch (error) {
        if (error instanceof LLMServiceError) {
            throw error;
        }
        if (error instanceof groq_sdk_1.default.APIError) {
            const message = error.message || 'Unknown Groq API error';
            const isRetryable = error.status === 429 || (error.status && error.status >= 500);
            throw new LLMServiceError(`Groq API error: ${message}`, error.status, isRetryable);
        }
        throw new LLMServiceError(`Failed to call LLM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=llmService.js.map