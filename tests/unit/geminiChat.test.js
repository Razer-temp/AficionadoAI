/**
 * Unit tests for Gemini chat service.
 * Tests language detection covering all four supported languages,
 * accent-based detection, and edge cases.
 * @module tests/unit/geminiChat
 */

import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../../src/services/geminiChat.js';

describe('detectLanguage', () => {
  // The detection uses keyword + accent scoring.
  // Spanish is prioritized when scores tie (checked first).

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
    // Multiple Spanish keywords — should detect as Spanish
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
