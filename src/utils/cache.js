/**
 * LRU (Least Recently Used) cache for repeated fan queries.
 * Avoids redundant Gemini API calls for common questions like
 * "What time do gates open?" asked multiple times in the same language.
 * @module cache
 */

import { CACHE_CONFIG } from './constants.js';

/**
 * @typedef {object} CacheEntry
 * @property {string} key - Normalized query key
 * @property {*} value - Cached response
 * @property {number} timestamp - When entry was cached (ms)
 */

/**
 * Creates an LRU cache instance with TTL expiration.
 * @param {object} [options] - Cache configuration
 * @param {number} [options.maxSize] - Maximum number of entries
 * @param {number} [options.ttlMs] - Time-to-live in milliseconds
 * @returns {{ get: Function, set: Function, has: Function, clear: Function, size: Function, entries: Function }}
 */
export function createLRUCache(options = {}) {
  const maxSize = options.maxSize || CACHE_CONFIG.maxSize;
  const ttlMs = options.ttlMs || CACHE_CONFIG.ttlMs;

  /** @type {Map<string, CacheEntry>} */
  const cache = new Map();

  /**
   * Checks if an entry has expired based on TTL.
   * @param {CacheEntry} entry
   * @returns {boolean}
   */
  function isExpired(entry) {
    return Date.now() - entry.timestamp > ttlMs;
  }

  /**
   * Retrieves a cached value by key. Returns undefined if not found or expired.
   * Moves accessed entry to "most recent" position (LRU behavior).
   * @param {string} key
   * @returns {*|undefined}
   */
  function get(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;

    if (isExpired(entry)) {
      cache.delete(key);
      return undefined;
    }

    // Move to most-recent position (delete + re-insert)
    cache.delete(key);
    cache.set(key, entry);
    return entry.value;
  }

  /**
   * Stores a value in the cache. Evicts the least recently used entry if at capacity.
   * @param {string} key
   * @param {*} value
   */
  function set(key, value) {
    // Delete existing to refresh position
    if (cache.has(key)) {
      cache.delete(key);
    }

    // Evict oldest if at capacity
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, { key, value, timestamp: Date.now() });
  }

  /**
   * Checks if a non-expired entry exists for the given key.
   * @param {string} key
   * @returns {boolean}
   */
  function has(key) {
    const entry = cache.get(key);
    if (!entry) return false;
    if (isExpired(entry)) {
      cache.delete(key);
      return false;
    }
    return true;
  }

  /** Clears all cached entries. */
  function clear() {
    cache.clear();
  }

  /**
   * Returns current cache size (including possibly expired entries).
   * @returns {number}
   */
  function size() {
    return cache.size;
  }

  /**
   * Returns all non-expired cache entries as an array (for debugging).
   * @returns {Array<{key: string, value: *, age: number}>}
   */
  function entries() {
    const now = Date.now();
    const result = [];
    for (const [k, entry] of cache) {
      if (!isExpired(entry)) {
        result.push({ key: k, value: entry.value, age: now - entry.timestamp });
      }
    }
    return result;
  }

  return { get, set, has, clear, size, entries };
}
