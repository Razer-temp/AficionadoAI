/**
 * Unit tests for input validation and sanitization.
 * @module tests/unit/validation
 */

import { describe, it, expect } from 'vitest';
import { validateChatInput, sanitizeInput, normalizeForCache } from '../../src/utils/validation.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('validateChatInput', () => {
  it('accepts valid input and returns sanitized version', () => {
    const result = validateChatInput('Where is Gate A?');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('Where is Gate A?');
  });

  it('trims whitespace', () => {
    const result = validateChatInput('  Hello  ');
    expect(result.sanitized).toBe('Hello');
  });

  it('throws on empty string', () => {
    expect(() => validateChatInput('')).toThrow(ValidationError);
  });

  it('throws on whitespace-only input', () => {
    expect(() => validateChatInput('   ')).toThrow(ValidationError);
  });

  it('throws on non-string input', () => {
    expect(() => validateChatInput(42)).toThrow(ValidationError);
    expect(() => validateChatInput(null)).toThrow(ValidationError);
    expect(() => validateChatInput(undefined)).toThrow(ValidationError);
  });

  it('throws on input exceeding max length', () => {
    const longInput = 'a'.repeat(1001);
    expect(() => validateChatInput(longInput)).toThrow(ValidationError);
  });

  it('accepts input at exactly max length', () => {
    const exactInput = 'a'.repeat(1000);
    const result = validateChatInput(exactInput);
    expect(result.valid).toBe(true);
  });

  it('sanitizes HTML in input', () => {
    const result = validateChatInput('<script>alert("xss")</script>');
    expect(result.sanitized).not.toContain('<script>');
    expect(result.sanitized).toContain('&lt;script&gt;');
  });

  it('handles multilingual input (Spanish)', () => {
    const result = validateChatInput('¿Dónde está la puerta A?');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('¿Dónde está la puerta A?');
  });

  it('handles multilingual input (Portuguese)', () => {
    const result = validateChatInput('Onde fica o portão B?');
    expect(result.valid).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('escapes HTML angle brackets', () => {
    expect(sanitizeInput('<div>')).toBe('&lt;div&gt;');
  });

  it('removes null bytes', () => {
    expect(sanitizeInput('hello\0world')).toBe('helloworld');
  });

  it('preserves normal text', () => {
    expect(sanitizeInput('Where is Gate C?')).toBe('Where is Gate C?');
  });

  it('preserves accented characters', () => {
    expect(sanitizeInput('café résumé naïve')).toBe('café résumé naïve');
  });
});

describe('normalizeForCache', () => {
  it('lowercases and trims input', () => {
    expect(normalizeForCache('  WHERE IS GATE A?  ', 'en')).toBe('en:where is gate a');
  });

  it('includes language prefix', () => {
    expect(normalizeForCache('hola', 'es')).toBe('es:hola');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeForCache('where   is   gate   a', 'en')).toBe('en:where is gate a');
  });

  it('removes trailing punctuation', () => {
    expect(normalizeForCache('where is gate a???', 'en')).toBe('en:where is gate a');
  });
});
