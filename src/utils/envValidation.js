/**
 * Startup environment variable validation.
 * Fails fast with a clear error message if required configuration is missing.
 * @module envValidation
 */

/** Required environment variables and their descriptions */
const REQUIRED_VARS = [
  { key: 'VITE_GEMINI_API_KEY', description: 'Google Gemini API key' },
  { key: 'VITE_SUPABASE_URL', description: 'Supabase project URL' },
  { key: 'VITE_SUPABASE_ANON_KEY', description: 'Supabase anonymous/public key' },
];

/**
 * Validates that all required environment variables are present.
 * Logs a clear error for each missing variable.
 * @returns {{ valid: boolean, missing: string[] }} Validation result
 */
export function validateEnvironment() {
  const missing = [];

  for (const { key, description } of REQUIRED_VARS) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '' || value.startsWith('your-')) {
      missing.push(`${key} (${description})`);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[Aficionado AI] Missing required environment variables:\n` +
        missing.map((m) => `  ❌ ${m}`).join('\n') +
        `\n\nCopy .env.example to .env and fill in your values.`,
    );
    return { valid: false, missing };
  }

  return { valid: true, missing: [] };
}

/**
 * Gets an environment variable with a fallback value.
 * @param {string} key - Environment variable name
 * @param {string} [fallback=''] - Fallback value if not set
 * @returns {string} The environment variable value or fallback
 */
export function getEnvVar(key, fallback = '') {
  return import.meta.env[key] || fallback;
}
