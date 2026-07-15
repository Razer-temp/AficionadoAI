/**
 * Token-bucket rate limiter for chat endpoints.
 * Prevents API abuse and controls Gemini API cost.
 * In production, this would use Redis for distributed rate limiting.
 * @module rateLimiter
 */

import { RATE_LIMIT } from './constants.js';
import { RateLimitError } from './errors.js';

/**
 * Creates a token-bucket rate limiter instance.
 * @param {object} [options] - Rate limiter configuration
 * @param {number} [options.maxTokens] - Maximum tokens (burst capacity)
 * @param {number} [options.refillRate] - Tokens added per refill interval
 * @param {number} [options.refillIntervalMs] - Milliseconds between refills
 * @returns {{ consume: Function, getTokens: Function, reset: Function }}
 */
export function createRateLimiter(options = {}) {
  const maxTokens = options.maxTokens || RATE_LIMIT.maxTokens;
  const refillRate = options.refillRate || RATE_LIMIT.refillRate;
  const refillIntervalMs = options.refillIntervalMs || RATE_LIMIT.refillIntervalMs;

  let tokens = maxTokens;
  let lastRefillTime = Date.now();

  /**
   * Refills tokens based on elapsed time since last refill.
   * Does not exceed maxTokens.
   */
  function refill() {
    const now = Date.now();
    const elapsed = now - lastRefillTime;
    const intervalsElapsed = Math.floor(elapsed / refillIntervalMs);

    if (intervalsElapsed > 0) {
      tokens = Math.min(maxTokens, tokens + intervalsElapsed * refillRate);
      lastRefillTime = now;
    }
  }

  /**
   * Attempts to consume one token. Throws RateLimitError if no tokens available.
   * @param {number} [cost=1] - Number of tokens to consume
   * @throws {RateLimitError} If insufficient tokens
   * @returns {boolean} true if token was consumed
   */
  function consume(cost = 1) {
    refill();

    if (tokens < cost) {
      throw new RateLimitError(
        `Too many requests. Try again in ${Math.ceil(refillIntervalMs / 1000)} seconds.`,
      );
    }

    tokens -= cost;
    return true;
  }

  /**
   * Returns the current number of available tokens (after refill).
   * @returns {number}
   */
  function getTokens() {
    refill();
    return tokens;
  }

  /** Resets the rate limiter to full capacity. */
  function reset() {
    tokens = maxTokens;
    lastRefillTime = Date.now();
  }

  return { consume, getTokens, reset };
}
