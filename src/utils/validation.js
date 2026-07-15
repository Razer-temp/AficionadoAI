/**
 * Input validation and sanitization utilities.
 * All user-facing input passes through these before reaching the LLM.
 * @module validation
 */

import { MAX_INPUT_LENGTH, MIN_INPUT_LENGTH } from './constants.js';
import { ValidationError } from './errors.js';

/**
 * Validates fan chat input for length, content, and safety.
 * @param {string} input - Raw user input
 * @returns {{ valid: boolean, sanitized: string }} Validation result with sanitized input
 * @throws {ValidationError} If input fails validation
 */
export function validateChatInput(input) {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string.');
  }

  const trimmed = input.trim();

  if (trimmed.length < MIN_INPUT_LENGTH) {
    throw new ValidationError('Message cannot be empty.');
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new ValidationError(
      `Message too long (${trimmed.length} characters). Maximum is ${MAX_INPUT_LENGTH}.`,
    );
  }

  const sanitized = sanitizeInput(trimmed);

  return { valid: true, sanitized };
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * while preserving legitimate multilingual text.
 * @param {string} input - Raw input string
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\0/g, '');
}

/**
 * Extracts a normalized query key for cache lookups.
 * Lowercases, trims, and removes excess whitespace.
 * @param {string} input - User query
 * @param {string} language - Detected language code
 * @returns {string} Normalized cache key
 */
export function normalizeForCache(input, language) {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?!.,;:]+$/g, '');
  return `${language}:${normalized}`;
}

/**
 * Sanitizes model output text before rendering.
 * Strips any residual HTML tags the model may have included,
 * removes control characters, and caps output length.
 * @param {string} text - Raw model response text
 * @param {number} [maxLength=5000] - Maximum allowed output length
 * @returns {string} Sanitized model text safe for rendering
 */
export function sanitizeModelText(text, maxLength = 5000) {
  if (typeof text !== 'string') return '';

  return (
    text
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars (keep \n, \r, \t)
      .slice(0, maxLength)
      .trim()
  );
}
