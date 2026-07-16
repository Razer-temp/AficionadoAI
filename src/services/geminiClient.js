/**
 * Centralized Gemini AI client factory.
 * All Gemini API access is funneled through this single module —
 * the API key is read once here and never leaves this file.
 *
 * Provides lazy-initialized model instances for both fan chat and ops briefing,
 * and a shared `isOfflineMode()` check used across the application.
 *
 * @module geminiClient
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG, GEMINI_BRIEFING_CONFIG, OFFLINE_API_KEY_PATTERNS } from '../utils/constants.js';
import { LLMError } from '../utils/errors.js';

/** @type {import('@google/generative-ai').GoogleGenerativeAI|null} */
let genAI = null;

/** @type {import('@google/generative-ai').GenerativeModel|null} */
let chatModel = null;

/** @type {import('@google/generative-ai').GenerativeModel|null} */
let briefingModel = null;

/**
 * Reads the Gemini API key from the environment.
 * @returns {string} The API key value (may be empty/undefined)
 */
function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

/**
 * Checks whether the application is running in offline mode.
 * Offline mode is active when the API key is missing, empty,
 * or matches a known test/mock pattern.
 *
 * @returns {boolean} True if offline (no live Gemini calls should be made)
 */
export function isOfflineMode() {
  const apiKey = getApiKey();
  if (!apiKey) return true;
  return OFFLINE_API_KEY_PATTERNS.includes(apiKey);
}

/**
 * Returns the lazily-initialized GoogleGenerativeAI instance.
 * @returns {import('@google/generative-ai').GoogleGenerativeAI}
 * @throws {LLMError} If the API key is not configured
 */
function getGenAI() {
  if (genAI) return genAI;

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new LLMError('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env');
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

/**
 * Returns a lazily-initialized Gemini model configured for fan chat.
 * Uses the default GEMINI_CONFIG (higher temperature for conversational tone).
 *
 * @returns {import('@google/generative-ai').GenerativeModel}
 * @throws {LLMError} If the API key is not configured
 */
export function getChatModel() {
  if (chatModel) return chatModel;

  chatModel = getGenAI().getGenerativeModel({
    model: GEMINI_CONFIG.model,
    generationConfig: {
      maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
      temperature: GEMINI_CONFIG.temperature,
      topP: GEMINI_CONFIG.topP,
    },
  });

  return chatModel;
}

/**
 * Returns a lazily-initialized Gemini model configured for ops briefings.
 * Uses GEMINI_BRIEFING_CONFIG (lower temperature for deterministic staff output).
 *
 * @returns {import('@google/generative-ai').GenerativeModel}
 * @throws {LLMError} If the API key is not configured
 */
export function getBriefingModel() {
  if (briefingModel) return briefingModel;

  briefingModel = getGenAI().getGenerativeModel({
    model: GEMINI_CONFIG.model,
    generationConfig: {
      maxOutputTokens: GEMINI_BRIEFING_CONFIG.maxOutputTokens,
      temperature: GEMINI_BRIEFING_CONFIG.temperature,
      topP: GEMINI_BRIEFING_CONFIG.topP,
    },
  });

  return briefingModel;
}
