import Groq from 'groq-sdk';
import { env } from '../config/env';

const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

export class LLMServiceError extends Error {
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;

  constructor(message: string, statusCode?: number, isRetryable: boolean = false) {
    super(message);
    this.name = 'LLMServiceError';
    this.statusCode = statusCode;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, LLMServiceError.prototype);
  }
}

export async function callLLM(prompt: string): Promise<string> {
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
  } catch (error) {
    if (error instanceof LLMServiceError) {
      throw error;
    }

    if (error instanceof Groq.APIError) {
      const message = error.message || 'Unknown Groq API error';
      const isRetryable = error.status === 429 || (error.status && error.status >= 500);
      throw new LLMServiceError(
        `Groq API error: ${message}`,
        error.status,
        isRetryable
      );
    }

    throw new LLMServiceError(
      `Failed to call LLM: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
