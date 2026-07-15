/**
 * Unit tests for LRU cache.
 * Supports persistent cache testing.
 * @module tests/unit/cache
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLRUCache } from '../../src/utils/cache.js';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Stub window and localStorage globally to cover persistence paths
vi.stubGlobal('window', { localStorage: localStorageMock });

describe('LRU Cache', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('stores and retrieves values', () => {
    const cache = createLRUCache();
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('restores cached values from localStorage on creation', () => {
    localStorageMock.setItem('aficionado_cache_store', JSON.stringify({
      'en:hello': { key: 'en:hello', value: 'Hi there', timestamp: Date.now() }
    }));
    const cache = createLRUCache();
    expect(cache.get('en:hello')).toBe('Hi there');
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
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('aficionado_cache_store');
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

  it('checks expired keys with has() returning false', () => {
    vi.useFakeTimers();
    const cache = createLRUCache({ ttlMs: 1000 });
    cache.set('key', 'val');
    vi.advanceTimersByTime(1500);
    expect(cache.has('key')).toBe(false);
    vi.useRealTimers();
  });

  it('handles localStorage errors in set() gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Quota exceeded');
    });
    const cache = createLRUCache();
    expect(() => cache.set('key', 'val')).not.toThrow();
  });

  it('handles localStorage errors in clear() gracefully', () => {
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new Error('Storage disabled');
    });
    const cache = createLRUCache();
    expect(() => cache.clear()).not.toThrow();
  });
});
