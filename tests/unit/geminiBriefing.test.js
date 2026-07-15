/**
 * Unit tests for Gemini operational briefing service.
 * @module tests/unit/geminiBriefing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBriefing } from '../../src/services/geminiBriefing.js';
import { LLMError } from '../../src/utils/errors.js';

// Mock Google Generative AI
const mockResponseText = vi
  .fn()
  .mockReturnValue('[STATUS: NORMAL OPERATIONS]\nSituation is calm.\nActions: None.');
const mockGenerateContent = vi.fn().mockResolvedValue({
  response: {
    text: mockResponseText,
  },
});
const mockGetGenerativeModel = vi.fn().mockReturnValue({
  generateContent: mockGenerateContent,
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe('generateBriefing', () => {
  const mockCrowdSnapshot = {
    label: 'Low Flow',
    zones: [
      { name: 'Gate A', density: 20, level: { label: 'Low Flow' } },
      { name: 'Gate B', density: 50, level: { label: 'Moderate Flow' } },
    ],
  };

  const mockQueries = [
    { language: 'en', intentCategory: 'navigation', zone: 'Gate A' },
    { language: 'es', intentCategory: 'accessibility', zone: 'Gate B' },
  ];

  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key-for-briefing');
    mockResponseText.mockReturnValue(
      '[STATUS: NORMAL OPERATIONS]\nSituation is calm.\nActions: None.',
    );
    mockGenerateContent.mockClear();
  });

  it('throws error if API key is missing on first call', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    await expect(generateBriefing(mockCrowdSnapshot, mockQueries)).rejects.toThrow(
      'Gemini API key not configured for briefings.',
    );
  });

  it('successfully generates an operational briefing with correct inputs', async () => {
    const result = await generateBriefing(mockCrowdSnapshot, mockQueries);
    expect(result.success).toBe(true);
    expect(result.data.briefing).toContain('[STATUS: NORMAL OPERATIONS]');
    expect(result.data.inputSummary.queryCount).toBe(2);
    expect(result.data.inputSummary.crowdLabel).toBe('Low Flow');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('supports weather snapshot data in inputs', async () => {
    const weatherSnapshot = {
      icon: '☀️',
      condition: 'Sunny',
      tempC: 25,
      tempF: 77,
      humidity: 40,
      uvIndex: 5,
      status: 'Normal',
    };
    const result = await generateBriefing(mockCrowdSnapshot, mockQueries, weatherSnapshot);
    expect(result.success).toBe(true);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('supports weather alert in inputs', async () => {
    const weatherSnapshot = {
      icon: '🌧️',
      condition: 'Rainy',
      tempC: 18,
      tempF: 64,
      humidity: 90,
      uvIndex: 1,
      status: 'Attention Required',
      alert: 'Heavy rain warning in East Rutherford',
    };
    const result = await generateBriefing(mockCrowdSnapshot, mockQueries, weatherSnapshot);
    expect(result.success).toBe(true);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('handles empty query sets gracefully', async () => {
    const result = await generateBriefing(mockCrowdSnapshot, []);
    expect(result.success).toBe(true);
    expect(result.data.inputSummary.queryCount).toBe(0);
  });

  it('throws LLMError when Gemini API fails', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Quota Exceeded'));
    await expect(generateBriefing(mockCrowdSnapshot, mockQueries)).rejects.toThrow(LLMError);
  });
});
