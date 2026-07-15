/**
 * Unit tests for output sanitization (model response safety).
 * Ensures model output is stripped of HTML, control characters,
 * and capped at the maximum length.
 * @module tests/unit/sanitizeModelText
 */

import { describe, it, expect } from 'vitest';
import { sanitizeModelText } from '../../src/utils/validation.js';

describe('sanitizeModelText', () => {
  it('returns empty string for non-string input', () => {
    expect(sanitizeModelText(null)).toBe('');
    expect(sanitizeModelText(undefined)).toBe('');
    expect(sanitizeModelText(42)).toBe('');
    expect(sanitizeModelText({})).toBe('');
  });

  it('returns the text unchanged when it is clean', () => {
    expect(sanitizeModelText('Hello, welcome to MetLife Stadium!')).toBe(
      'Hello, welcome to MetLife Stadium!',
    );
  });

  it('strips HTML tags from model output', () => {
    const input = '<script>alert("xss")</script>Safe text';
    const result = sanitizeModelText(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Safe text');
  });

  it('strips nested HTML tags', () => {
    const input = '<div class="evil"><p>content</p></div>';
    const result = sanitizeModelText(input);
    expect(result).not.toContain('<div');
    expect(result).not.toContain('<p>');
    expect(result).toContain('content');
  });

  it('removes control characters but preserves newlines and tabs', () => {
    const input = 'Line 1\nLine 2\tTabbed\x00\x01\x02';
    const result = sanitizeModelText(input);
    expect(result).toContain('\n');
    expect(result).toContain('\t');
    expect(result).not.toContain('\x00');
    expect(result).not.toContain('\x01');
  });

  it('caps output at maxLength', () => {
    const longText = 'a'.repeat(10000);
    const result = sanitizeModelText(longText, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('uses default maxLength of 5000', () => {
    const longText = 'b'.repeat(6000);
    const result = sanitizeModelText(longText);
    expect(result.length).toBeLessThanOrEqual(5000);
  });

  it('trims whitespace from result', () => {
    const input = '  Hello World  ';
    const result = sanitizeModelText(input);
    expect(result).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(sanitizeModelText('')).toBe('');
  });

  it('preserves accented characters', () => {
    const input = '¿Dónde está la puerta? Bienvenue à la porte!';
    expect(sanitizeModelText(input)).toBe(input);
  });

  it('preserves markdown formatting (bold, bullets)', () => {
    const input = '**Bold text**\n- Bullet point';
    expect(sanitizeModelText(input)).toBe('**Bold text**\n- Bullet point');
  });
});
