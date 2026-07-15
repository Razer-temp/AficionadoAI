/**
 * Unit tests for environment variable validation.
 * @module tests/unit/envValidation
 */

import { describe, it, expect, vi } from 'vitest';
import { validateEnvironment, getEnvVar } from '../../src/utils/envValidation.js';

describe('validateEnvironment', () => {
  it('returns valid: true when all environment variables are present', () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-anon-key');

    const result = validateEnvironment();
    expect(result.valid).toBe(true);
    expect(result.missing.length).toBe(0);
  });

  it('returns valid: false and lists missing variables when some are missing', () => {
    // Stub some as empty strings or missing
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'your-anon-key'); // starts with 'your-'

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = validateEnvironment();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('VITE_GEMINI_API_KEY (Google Gemini API key)');
    expect(result.missing).toContain('VITE_SUPABASE_ANON_KEY (Supabase anonymous/public key)');
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});

describe('getEnvVar', () => {
  it('returns environment variable value if set', () => {
    vi.stubEnv('TEST_ENV_VAR', 'hello-value');
    expect(getEnvVar('TEST_ENV_VAR', 'fallback')).toBe('hello-value');
  });

  it('getEnvVar returns fallback when env var is not set', () => {
    vi.stubEnv('NON_EXISTENT_VAR', '');
    const result = getEnvVar('NON_EXISTENT_VAR', 'fallback-value');
    expect(result).toBe('fallback-value');
  });

  it('getEnvVar returns empty string as default fallback', () => {
    vi.stubEnv('NON_EXISTENT_VAR2', '');
    const result = getEnvVar('NON_EXISTENT_VAR2');
    expect(result).toBe('');
  });
});
