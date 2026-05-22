export declare class LLMServiceError extends Error {
    readonly statusCode?: number;
    readonly isRetryable: boolean;
    constructor(message: string, statusCode?: number, isRetryable?: boolean);
}
export declare function callLLM(prompt: string): Promise<string>;
//# sourceMappingURL=llmService.d.ts.map