/**
 * Unit tests for Gemini chat service.
 * Tests language detection covering all four supported languages,
 * accent-based detection, sendChatMessage pipeline, caching, and rate limiting.
 * @module tests/unit/geminiChat
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectLanguage,
  sendChatMessage,
  getCacheStats,
  resetRateLimiter,
} from '../../src/services/geminiChat.js';
import { LLMError } from '../../src/utils/errors.js';

// Stub environment
vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key-for-stadium');

// Mock Google Generative AI
const mockResponseText = vi.fn().mockReturnValue('The gates open at 2:00 PM.');
const mockSendMessage = vi.fn().mockResolvedValue({
  response: {
    text: mockResponseText,
  },
});
const mockStartChat = vi.fn().mockReturnValue({
  sendMessage: mockSendMessage,
});
const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: mockResponseText,
  },
});
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  startChat: mockStartChat,
  generateContent: mockGenerateContent,
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe('detectLanguage', () => {
  it('returns "en" for ambiguous/short text with no language signals', () => {
    expect(detectLanguage('hello world')).toBe('en');
  });

  it('returns "en" for empty string', () => {
    expect(detectLanguage('')).toBe('en');
  });

  it('returns "en" for numeric-only input', () => {
    expect(detectLanguage('12345')).toBe('en');
  });

  it('returns "en" for special characters only', () => {
    expect(detectLanguage('!@#$%^&*()')).toBe('en');
  });

  it('returns "es" for clear Spanish text with keywords', () => {
    expect(detectLanguage('Hola, necesito ayuda con la entrada')).toBe('es');
  });

  it('returns "es" for Spanish question with dónde', () => {
    expect(detectLanguage('¿Dónde está la puerta A?')).toBe('es');
  });

  it('returns "es" for Spanish text with ñ character', () => {
    expect(detectLanguage('año nuevo')).toBe('es');
  });

  it('returns "es" for Spanish gratitude', () => {
    expect(detectLanguage('Gracias, necesito la sección VIP')).toBe('es');
  });

  it('returns "fr" for clear French text with unique keywords', () => {
    expect(detectLanguage('Bonjour, voudrais un billet merci')).toBe('fr');
  });

  it('returns "fr" for French with ç and è accents', () => {
    expect(detectLanguage('garçon français')).toBe('fr');
  });

  it('returns "pt" for Portuguese with ã character', () => {
    expect(detectLanguage('não pão irmão capitão')).toBe('pt');
  });

  it('returns "pt" for clear Portuguese with unique keywords', () => {
    expect(detectLanguage('Obrigado, preciso do portão')).toBe('pt');
  });

  it('handles mixed language, dominant wins', () => {
    const result = detectLanguage('Hola, dónde está la comida, necesito ayuda');
    expect(result).toBe('es');
  });

  it('returns a valid language code for any input', () => {
    const validCodes = ['en', 'es', 'fr', 'pt'];
    expect(validCodes).toContain(detectLanguage('random text'));
    expect(validCodes).toContain(detectLanguage(''));
    expect(validCodes).toContain(detectLanguage('Bonjour'));
    expect(validCodes).toContain(detectLanguage('Hola'));
    expect(validCodes).toContain(detectLanguage('Olá'));
  });
});

describe('sendChatMessage integration', () => {
  beforeEach(() => {
    resetRateLimiter();
    mockResponseText.mockReturnValue('The gates open at 2:00 PM.');
    mockSendMessage.mockClear();
    mockStartChat.mockClear();
  });

  it('successfully calls Gemini and returns formatted response', async () => {
    const result = await sendChatMessage('What time do gates open?');
    expect(result.success).toBe(true);
    expect(result.data.response).toBe('The gates open at 2:00 PM.');
    expect(result.data.language).toBe('en');
    expect(result.data.cached).toBe(false);
    expect(mockStartChat).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith('What time do gates open?');
  });

  it('caches the query and retrieves it on subsequent calls', async () => {
    // First call (cache miss)
    const res1 = await sendChatMessage('Where is the first aid station?');
    expect(res1.data.cached).toBe(false);

    // Second call (cache hit)
    const res2 = await sendChatMessage('Where is the first aid station?');
    expect(res2.data.cached).toBe(true);
    expect(res2.data.response).toBe('The gates open at 2:00 PM.'); // returns cached value
    expect(mockStartChat).toHaveBeenCalledTimes(1); // should not trigger Gemini again
  });

  it('bypasses cache when query is crowd-related', async () => {
    mockResponseText.mockReturnValue('Gate C has low crowd density.');
    // First call
    const res1 = await sendChatMessage('Is Gate C crowded?', [], { zones: [] });
    expect(res1.data.cached).toBe(false);

    // Second call - should still be a miss for crowd queries
    const res2 = await sendChatMessage('Is Gate C crowded?', [], { zones: [] });
    expect(res2.data.cached).toBe(false);
  });

  it('enforces rate limits', async () => {
    // Consume all rate limit tokens
    for (let i = 0; i < 10; i++) {
      await sendChatMessage(`message-${i}`);
    }
    // The 11th call should throw a RateLimitError
    await expect(sendChatMessage('too fast')).rejects.toThrow('Too many requests');
  });

  it('handles Gemini errors gracefully', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('API quota exceeded'));
    await expect(sendChatMessage('trigger error')).rejects.toThrow(LLMError);
  });

  it('returns cache stats', () => {
    const stats = getCacheStats();
    expect(stats.size).toBeDefined();
    expect(Array.isArray(stats.entries)).toBe(true);
  });
});
