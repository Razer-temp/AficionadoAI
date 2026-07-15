/**
 * Unit tests for environment variable validation.
 * @module tests/unit/envValidation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('validateEnvironment', () => {
  beforeEach(() => {
    // Save and clear import.meta.env for testing
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports validateEnvironment function', async () => {
    const mod = await import('../../src/utils/envValidation.js');
    expect(typeof mod.validateEnvironment).toBe('function');
  });

  it('exports getEnvVar function', async () => {
    const mod = await import('../../src/utils/envValidation.js');
    expect(typeof mod.getEnvVar).toBe('function');
  });

  it('getEnvVar returns fallback when env var is not set', async () => {
    const { getEnvVar } = await import('../../src/utils/envValidation.js');
    const result = getEnvVar('NON_EXISTENT_VAR', 'fallback-value');
    expect(result).toBe('fallback-value');
  });

  it('getEnvVar returns empty string as default fallback', async () => {
    const { getEnvVar } = await import('../../src/utils/envValidation.js');
    const result = getEnvVar('NON_EXISTENT_VAR');
    expect(result).toBe('');
  });
});
