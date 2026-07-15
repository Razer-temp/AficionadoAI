/**
 * Unit tests for custom error hierarchy.
 * @module tests/unit/errors
 */

import { describe, it, expect } from 'vitest';
import {
  AficionadoError,
  ValidationError,
  RateLimitError,
  LLMError,
  KnowledgeBaseError,
  formatErrorResponse,
} from '../../src/utils/errors.js';

describe('Custom Error Classes', () => {
  it('AficionadoError has correct name and code', () => {
    const err = new AficionadoError('test', 'TEST_CODE');
    expect(err.name).toBe('AficionadoError');
    expect(err.code).toBe('TEST_CODE');
    expect(err.message).toBe('test');
    expect(err instanceof Error).toBe(true);
  });

  it('ValidationError has correct code', () => {
    const err = new ValidationError('bad input');
    expect(err.name).toBe('ValidationError');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err instanceof AficionadoError).toBe(true);
  });

  it('RateLimitError has default message', () => {
    const err = new RateLimitError();
    expect(err.message).toContain('Too many requests');
    expect(err.code).toBe('RATE_LIMIT');
  });

  it('LLMError has correct code', () => {
    const err = new LLMError('API timeout');
    expect(err.name).toBe('LLMError');
    expect(err.code).toBe('LLM_ERROR');
  });

  it('KnowledgeBaseError has correct code', () => {
    const err = new KnowledgeBaseError('KB lookup failed');
    expect(err.code).toBe('KNOWLEDGE_BASE_ERROR');
  });
});

describe('formatErrorResponse', () => {
  it('formats AficionadoError into response envelope', () => {
    const err = new ValidationError('too long');
    const result = formatErrorResponse(err);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(result.error.message).toBe('too long');
  });

  it('formats unknown errors with generic message', () => {
    const err = new Error('something broke');
    const result = formatErrorResponse(err);
    expect(result.success).toBe(false);
    expect(result.error.code).toBe('UNKNOWN_ERROR');
    expect(result.error.message).toBe('An unexpected error occurred.');
  });
});
