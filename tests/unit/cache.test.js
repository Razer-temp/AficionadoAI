/**
 * Unit tests for LRU cache.
 * @module tests/unit/cache
 */

import { describe, it, expect, vi } from 'vitest';
import { createLRUCache } from '../../src/utils/cache.js';

describe('LRU Cache', () => {
  it('stores and retrieves values', () => {
    const cache = createLRUCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    const cache = createLRUCache();
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('evicts least recently used entry when at capacity', () => {
    const cache = createLRUCache({ maxSize: 3 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // Should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('d')).toBe(4);
  });

  it('promotes accessed entry to most recent', () => {
    const cache = createLRUCache({ maxSize: 3 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // Promote 'a'
    cache.set('d', 4); // Should evict 'b' (not 'a')
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('reports correct size', () => {
    const cache = createLRUCache({ maxSize: 5 });
    expect(cache.size()).toBe(0);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
  });

  it('clears all entries', () => {
    const cache = createLRUCache();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('checks existence with has()', () => {
    const cache = createLRUCache();
    cache.set('key', 'val');
    expect(cache.has('key')).toBe(true);
    expect(cache.has('missing')).toBe(false);
  });

  it('expires entries after TTL', () => {
    vi.useFakeTimers();
    const cache = createLRUCache({ ttlMs: 1000 });
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');

    vi.advanceTimersByTime(1500);
    expect(cache.get('key')).toBeUndefined();
    vi.useRealTimers();
  });

  it('overwrites existing keys', () => {
    const cache = createLRUCache();
    cache.set('key', 'old');
    cache.set('key', 'new');
    expect(cache.get('key')).toBe('new');
    expect(cache.size()).toBe(1);
  });
});
