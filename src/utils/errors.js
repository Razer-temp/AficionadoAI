/**
 * Custom error hierarchy for Aficionado AI.
 * Provides typed errors with error codes for consistent API responses.
 * @module errors
 */

import { ERROR_CODES } from './constants.js';

/**
 * Base error class for all Aficionado AI errors.
 * Extends native Error with a machine-readable error code.
 */
export class AficionadoError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} code - Machine-readable error code from ERROR_CODES
   */
  constructor(message, code = ERROR_CODES.UNKNOWN) {
    super(message);
    this.name = 'AficionadoError';
    this.code = code;
  }
}

/**
 * Thrown when user input fails validation (empty, too long, malformed).
 */
export class ValidationError extends AficionadoError {
  /**
   * @param {string} message - What failed validation and why
   */
  constructor(message) {
    super(message, ERROR_CODES.VALIDATION);
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when a client exceeds the rate limit for chat requests.
 */
export class RateLimitError extends AficionadoError {
  /**
   * @param {string} [message] - Custom message
   */
  constructor(message = 'Too many requests. Please try again in a moment.') {
    super(message, ERROR_CODES.RATE_LIMIT);
    this.name = 'RateLimitError';
  }
}

/**
 * Thrown when the Gemini LLM call fails (network, quota, malformed response).
 */
export class LLMError extends AficionadoError {
  /**
   * @param {string} message - Description of the LLM failure
   */
  constructor(message) {
    super(message, ERROR_CODES.LLM_ERROR);
    this.name = 'LLMError';
  }
}

/**
 * Thrown when knowledge base retrieval fails.
 */
export class KnowledgeBaseError extends AficionadoError {
  /**
   * @param {string} message - Description of the KB failure
   */
  constructor(message) {
    super(message, ERROR_CODES.KB_ERROR);
    this.name = 'KnowledgeBaseError';
  }
}

/**
 * Formats any error into a consistent API response envelope.
 * @param {Error} error - The error to format
 * @returns {{ success: boolean, error: { code: string, message: string }}}
 */
export function formatErrorResponse(error) {
  if (error instanceof AficionadoError) {
    return {
      success: false,
      error: { code: error.code, message: error.message },
    };
  }
  return {
    success: false,
    error: { code: ERROR_CODES.UNKNOWN, message: 'An unexpected error occurred.' },
  };
}
