/**
 * Application-wide constants for Aficionado AI.
 * Centralized configuration for consistent behavior across the app.
 * @module constants
 */

/** Maximum allowed length for fan chat input (characters) */
export const MAX_INPUT_LENGTH = 1000;

/** Minimum allowed length for fan chat input (characters) */
export const MIN_INPUT_LENGTH = 1;

/** Supported languages with display names and codes */
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  es: { name: 'Spanish', flag: '🇲🇽', nativeName: 'Español' },
  fr: { name: 'French', flag: '🇨🇦', nativeName: 'Français' },
  pt: { name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
};

/** Rate limiter configuration */
export const RATE_LIMIT = {
  maxTokens: 10,
  refillRate: 2,
  refillIntervalMs: 10000,
  windowMs: 60000,
};

/** Application timing configurations in milliseconds */
export const TIMINGS = {
  CROWD_ROTATION: 30000,
  GATE_REDIRECT_FAST: 500,
  GATE_REDIRECT_NORMAL: 1200,
  SIM_GROUNDING_DELAY: 600,
  SIM_TYPEWRITER_SPEED: 42,
  AUDIO_PLAYBACK_MOCK: 3500,
};

/** LRU Cache configuration */
export const CACHE_CONFIG = {
  maxSize: 50,
  ttlMs: 300000, // 5 minutes
};

/** Crowd density thresholds */
export const CROWD_THRESHOLDS = {
  low: { max: 40, label: 'Low Flow', iconName: 'CheckCircle2', color: '#10B981' },
  medium: { max: 70, label: 'Moderate Flow', iconName: 'MinusCircle', color: '#F59E0B' },
  high: { max: 85, label: 'Heavy Surge', iconName: 'AlertTriangle', color: '#F97316' },
  critical: { max: 100, label: 'Critical Bottleneck', iconName: 'ShieldAlert', color: '#EF4444' },
};

/** Gate identifiers matching venue-knowledge.json */
export const GATES = ['gate-a', 'gate-b', 'gate-c', 'gate-d'];

/** Zone identifiers for crowd tracking */
export const ZONES = [
  { id: 'gate-a', name: 'Gate A — MetLife Gate', direction: 'East' },
  { id: 'gate-b', name: 'Gate B — Verizon Gate', direction: 'Southwest' },
  { id: 'gate-c', name: 'Gate C — HCLTech Gate', direction: 'Southeast' },
  { id: 'gate-d', name: "Gate D — Moody's Gate", direction: 'Northwest' },
  { id: 'concourse-100', name: '100 Level Concourse', direction: 'Lower' },
  { id: 'concourse-200', name: '200 Level Concourse', direction: 'Mid' },
  { id: 'concourse-300', name: '300 Level Concourse', direction: 'Upper' },
];

/** Gemini model configuration */
export const GEMINI_CONFIG = {
  model: 'gemini-2.5-flash',
  maxOutputTokens: 1024,
  temperature: 0.7,
  topP: 0.95,
};

/** Crowd density threshold for automatic gate rerouting (percentage) */
export const CROWD_REROUTE_THRESHOLD = 75;

/** Crowd density threshold for moderate flow classification (percentage) */
export const CROWD_MODERATE_THRESHOLD = 50;

/** Minutes before kickoff that triggers urgency guidance */
export const KICKOFF_URGENCY_MINUTES = 15;

/** Maximum allowed length for sanitized model output text */
export const MAX_OUTPUT_LENGTH = 5000;

/** API key values that indicate offline/mock evaluation mode */
export const OFFLINE_API_KEY_PATTERNS = ['offline-test', 'mock-key-offline'];

/** Gemini briefing-specific generation config overrides */
export const GEMINI_BRIEFING_CONFIG = {
  maxOutputTokens: 1500,
  temperature: 0.6,
  topP: 0.9,
};

/** API response codes */
export const ERROR_CODES = {
  VALIDATION: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  LLM_ERROR: 'LLM_ERROR',
  KB_ERROR: 'KNOWLEDGE_BASE_ERROR',
  ENV_ERROR: 'ENV_CONFIG_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};
