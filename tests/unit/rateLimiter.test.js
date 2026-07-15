/**
 * Unit tests for token-bucket rate limiter.
 * @module tests/unit/rateLimiter
 */

import { describe, it, expect, vi } from 'vitest';
import { createRateLimiter } from '../../src/utils/rateLimiter.js';
import { RateLimitError } from '../../src/utils/errors.js';

describe('Rate Limiter', () => {
  it('allows requests within rate limit', () => {
    const limiter = createRateLimiter({ maxTokens: 5 });
    expect(() => limiter.consume()).not.toThrow();
    expect(() => limiter.consume()).not.toThrow();
  });

  it('throws RateLimitError when tokens exhausted', () => {
    const limiter = createRateLimiter({ maxTokens: 2 });
    limiter.consume();
    limiter.consume();
    expect(() => limiter.consume()).toThrow(RateLimitError);
  });

  it('reports correct token count', () => {
    const limiter = createRateLimiter({ maxTokens: 5 });
    expect(limiter.getTokens()).toBe(5);
    limiter.consume();
    expect(limiter.getTokens()).toBe(4);
  });

  it('refills tokens over time', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({
      maxTokens: 5,
      refillRate: 1,
      refillIntervalMs: 1000,
    });

    // Use all tokens
    for (let i = 0; i < 5; i++) limiter.consume();
    expect(limiter.getTokens()).toBe(0);

    // Wait for refill
    vi.advanceTimersByTime(3000);
    expect(limiter.getTokens()).toBe(3);
    vi.useRealTimers();
  });

  it('does not exceed max tokens on refill', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({
      maxTokens: 5,
      refillRate: 10,
      refillIntervalMs: 1000,
    });

    limiter.consume();
    vi.advanceTimersByTime(5000);
    expect(limiter.getTokens()).toBe(5); // Capped at maxTokens
    vi.useRealTimers();
  });

  it('resets to full capacity', () => {
    const limiter = createRateLimiter({ maxTokens: 5 });
    for (let i = 0; i < 5; i++) limiter.consume();
    limiter.reset();
    expect(limiter.getTokens()).toBe(5);
  });

  it('error includes informative message', () => {
    const limiter = createRateLimiter({ maxTokens: 1 });
    limiter.consume();
    try {
      limiter.consume();
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError);
      expect(err.message).toContain('Too many requests');
      expect(err.code).toBe('RATE_LIMIT');
    }
  });
});
