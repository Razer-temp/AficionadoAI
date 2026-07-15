/**
 * Unit tests for application constants integrity.
 * Validates that constants maintain expected shapes and values.
 * @module tests/unit/constants
 */

import { describe, it, expect } from 'vitest';
import {
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
  SUPPORTED_LANGUAGES,
  RATE_LIMIT,
  CACHE_CONFIG,
  CROWD_THRESHOLDS,
  GATES,
  ZONES,
  GEMINI_CONFIG,
  ERROR_CODES,
} from '../../src/utils/constants.js';

describe('Input constraints', () => {
  it('MAX_INPUT_LENGTH is a positive number', () => {
    expect(MAX_INPUT_LENGTH).toBeGreaterThan(0);
    expect(typeof MAX_INPUT_LENGTH).toBe('number');
  });

  it('MIN_INPUT_LENGTH is at least 1', () => {
    expect(MIN_INPUT_LENGTH).toBeGreaterThanOrEqual(1);
  });

  it('MAX_INPUT_LENGTH > MIN_INPUT_LENGTH', () => {
    expect(MAX_INPUT_LENGTH).toBeGreaterThan(MIN_INPUT_LENGTH);
  });
});

describe('SUPPORTED_LANGUAGES', () => {
  it('includes en, es, fr, pt', () => {
    expect(SUPPORTED_LANGUAGES).toHaveProperty('en');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('es');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('fr');
    expect(SUPPORTED_LANGUAGES).toHaveProperty('pt');
  });

  it('each language has name, flag, and nativeName', () => {
    for (const [, lang] of Object.entries(SUPPORTED_LANGUAGES)) {
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('flag');
      expect(lang).toHaveProperty('nativeName');
      expect(typeof lang.name).toBe('string');
      expect(typeof lang.nativeName).toBe('string');
    }
  });
});

describe('RATE_LIMIT', () => {
  it('has required configuration keys', () => {
    expect(RATE_LIMIT).toHaveProperty('maxTokens');
    expect(RATE_LIMIT).toHaveProperty('refillRate');
    expect(RATE_LIMIT).toHaveProperty('refillIntervalMs');
  });

  it('maxTokens is a positive number', () => {
    expect(RATE_LIMIT.maxTokens).toBeGreaterThan(0);
  });

  it('refillRate does not exceed maxTokens', () => {
    expect(RATE_LIMIT.refillRate).toBeLessThanOrEqual(RATE_LIMIT.maxTokens);
  });
});

describe('CACHE_CONFIG', () => {
  it('has maxSize and ttlMs', () => {
    expect(CACHE_CONFIG).toHaveProperty('maxSize');
    expect(CACHE_CONFIG).toHaveProperty('ttlMs');
  });

  it('maxSize is positive', () => {
    expect(CACHE_CONFIG.maxSize).toBeGreaterThan(0);
  });

  it('ttlMs is positive', () => {
    expect(CACHE_CONFIG.ttlMs).toBeGreaterThan(0);
  });
});

describe('CROWD_THRESHOLDS', () => {
  it('has all four density levels', () => {
    expect(CROWD_THRESHOLDS).toHaveProperty('low');
    expect(CROWD_THRESHOLDS).toHaveProperty('medium');
    expect(CROWD_THRESHOLDS).toHaveProperty('high');
    expect(CROWD_THRESHOLDS).toHaveProperty('critical');
  });

  it('each level has max, label, and color', () => {
    for (const [, config] of Object.entries(CROWD_THRESHOLDS)) {
      expect(config).toHaveProperty('max');
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(typeof config.max).toBe('number');
      expect(typeof config.label).toBe('string');
    }
  });

  it('threshold maxes are in ascending order', () => {
    expect(CROWD_THRESHOLDS.low.max).toBeLessThan(CROWD_THRESHOLDS.medium.max);
    expect(CROWD_THRESHOLDS.medium.max).toBeLessThan(CROWD_THRESHOLDS.high.max);
    expect(CROWD_THRESHOLDS.high.max).toBeLessThan(CROWD_THRESHOLDS.critical.max);
  });
});

describe('GATES', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(GATES)).toBe(true);
    expect(GATES.length).toBeGreaterThan(0);
    GATES.forEach((gate) => expect(typeof gate).toBe('string'));
  });
});

describe('ZONES', () => {
  it('is a non-empty array of zone objects', () => {
    expect(Array.isArray(ZONES)).toBe(true);
    expect(ZONES.length).toBeGreaterThan(0);
  });

  it('each zone has id, name, and direction', () => {
    ZONES.forEach((zone) => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('direction');
    });
  });
});

describe('GEMINI_CONFIG', () => {
  it('has required model configuration', () => {
    expect(GEMINI_CONFIG).toHaveProperty('model');
    expect(GEMINI_CONFIG).toHaveProperty('maxOutputTokens');
    expect(GEMINI_CONFIG).toHaveProperty('temperature');
    expect(GEMINI_CONFIG).toHaveProperty('topP');
  });

  it('model is a non-empty string', () => {
    expect(typeof GEMINI_CONFIG.model).toBe('string');
    expect(GEMINI_CONFIG.model.length).toBeGreaterThan(0);
  });

  it('temperature is between 0 and 2', () => {
    expect(GEMINI_CONFIG.temperature).toBeGreaterThanOrEqual(0);
    expect(GEMINI_CONFIG.temperature).toBeLessThanOrEqual(2);
  });

  it('topP is between 0 and 1', () => {
    expect(GEMINI_CONFIG.topP).toBeGreaterThan(0);
    expect(GEMINI_CONFIG.topP).toBeLessThanOrEqual(1);
  });
});

describe('ERROR_CODES', () => {
  it('has all expected error codes', () => {
    expect(ERROR_CODES).toHaveProperty('VALIDATION');
    expect(ERROR_CODES).toHaveProperty('RATE_LIMIT');
    expect(ERROR_CODES).toHaveProperty('LLM_ERROR');
    expect(ERROR_CODES).toHaveProperty('KB_ERROR');
    expect(ERROR_CODES).toHaveProperty('ENV_ERROR');
    expect(ERROR_CODES).toHaveProperty('UNKNOWN');
  });

  it('all error codes are non-empty strings', () => {
    for (const [, value] of Object.entries(ERROR_CODES)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });
});
