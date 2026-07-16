import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendChatMessage } from '../../src/services/geminiChat';
import { generateBriefing } from '../../src/services/geminiBriefing';
import { createCrowdDataManager } from '../../src/data/mockCrowdData';

// Mock Google Generative AI for the integration test
const mockChatResponse = vi.fn();
const mockBriefingResponse = vi.fn();

const mockSendMessage = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    response: { text: mockChatResponse },
  });
});

const mockGenerateContent = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    response: { text: mockBriefingResponse },
  });
});

const mockGetGenerativeModel = vi.fn().mockReturnValue({
  startChat: vi.fn().mockReturnValue({ sendMessage: mockSendMessage }),
  generateContent: mockGenerateContent,
});

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

describe('Fan to Ops Intelligence Loop (Integration)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
    vi.clearAllMocks();
  });

  it('successfully routes a fan query into an ops briefing synthesis', async () => {
    // 1. Simulating a Fan Query asking about accessibility at Gate C
    const fanQuery = "¿Dónde está la entrada para sillas de ruedas en la puerta C?";
    
    // Mock the LLM returning a JSON string for the chat response
    mockChatResponse.mockReturnValueOnce(JSON.stringify({
      response: "La entrada accesible para sillas de ruedas en la Puerta C se encuentra a la derecha de los torniquetes principales.",
      language: "es",
      intents: ["accessibility", "wayfinding"],
      confidence: 0.95
    }));

    // Step 1: Send query via Fan Chat service
    const chatResult = await sendChatMessage(fanQuery, []);
    
    expect(chatResult.success).toBe(true);
    expect(chatResult.data.language).toBe('es');
    expect(chatResult.data.intents).toContain('accessibility');

    // 2. Formatting the interaction for the Ops Feed
    const loggedQuery = {
      language: chatResult.data.language,
      intentCategory: chatResult.data.intents[0] || 'general',
      zone: 'gate-c', // Extracted by UI
      queryPreview: fanQuery.slice(0, 50),
    };

    // 3. Simulating Ops Dashboard State (Crowd Data at Gate C)
    const crowdManager = createCrowdDataManager();
    crowdManager.simulateIncident(); // Surges Gate C to 95%
    const currentCrowdSnapshot = crowdManager.getCurrentSnapshot();
    
    // Mock the LLM returning a briefing synthesis
    mockBriefingResponse.mockReturnValueOnce(
      "[STATUS: ACTION REQUIRED / TACTICAL DISPATCH]\n" +
      "Gate C density is critical (95%) and we are receiving Spanish accessibility queries for this zone.\n" +
      "- Deploy bilingual (ES) guest services to Gate C to assist with wheelchair routing."
    );

    // Step 4: Generate Ops Briefing incorporating the Fan Query
    const briefingResult = await generateBriefing(
      currentCrowdSnapshot,
      [loggedQuery], // Inject the logged query from the fan
      null
    );

    expect(briefingResult.success).toBe(true);
    expect(briefingResult.data.inputSummary.queryCount).toBe(1);
    expect(briefingResult.data.briefing).toContain('[STATUS: ACTION REQUIRED');
    
    // Verify the LLM was called with context containing the fan's zone and intent
    const briefingCallArgs = mockGenerateContent.mock.calls[0][0];
    const systemInstruction = briefingCallArgs.systemInstruction.parts[0].text;
    const userPrompt = briefingCallArgs.contents[0].parts[0].text;
    
    // Ensure the system instruction was passed correctly
    expect(systemInstruction).toContain('Aficionado AI Operations Briefing System');
    
    // Ensure the user prompt contained the analyzed query data
    expect(userPrompt).toContain('gate-c');
    expect(userPrompt).toContain('navigation');
    expect(userPrompt).toContain('Spanish'); // Language name resolved from 'es'
  });
});
