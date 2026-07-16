/**
 * Custom hook for the landing page interactive simulator.
 * Manages the 4-stage LLM streaming simulation, chat history,
 * ops feed synchronization, and UI interaction states.
 * @module useLandingSimulator
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SIMULATOR_PROMPTS, INITIAL_OPS_FEED } from '../components/landing/landingData';
import { Sparkles } from 'lucide-react';
import { TIMINGS } from '../utils/constants';

/**
 * Initial welcome message shown in the simulator chat.
 * @type {Array<object>}
 */
const INITIAL_CHAT = [
  {
    id: 'welcome-1',
    role: 'ai',
    text: 'Welcome to MetLife Stadium! Ask any question about gates, food, transit, or WCAG AA accessibility in English, Spanish, French, or Portuguese.',
    badge: 'Grounded in Venue Topology',
    badgeColor: 'emerald',
    crowdStatus: 'All Gates Operational',
    audioSnippet: 'Responded in English (EN) · Ready',
    time: 'Just now',
    isCompleted: true,
  },
];

/**
 * Hook providing all state and handlers for the landing page simulator.
 * @returns {object} Simulator state and handler functions
 */
export function useLandingSimulator() {
  // Interactive Simulator State
  const [activeTab, setActiveTab] = useState('fan');
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(null);
  const [customInput, setCustomInput] = useState('');
  const [opsFeed, setOpsFeed] = useState(INITIAL_OPS_FEED);
  const [surgeActive, setSurgeActive] = useState(false);

  // 4-Stage LLM Streaming & Grounding State
  const [aiState, setAiState] = useState('idle');
  const [activeGroundingStep, setActiveGroundingStep] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [likedMessageIds, setLikedMessageIds] = useState({});

  // Chat History
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT);

  const chatScrollRef = useRef(null);
  const streamTimerRef = useRef(null);

  // Auto-scroll chat when messages or streaming text update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, streamingText, aiState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  /**
   * Core 4-Stage LLM Generation Trigger.
   * @param {object} promptPreset - Prompt preset or custom prompt object
   * @param {number|null} scenarioIdx - Index of active scenario card
   */
  const triggerLlmGeneration = useCallback((promptPreset, scenarioIdx = null) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);

    setActiveScenarioIndex(scenarioIdx);
    const userMsgId = 'user-' + Date.now();
    const aiMsgId = 'ai-' + Date.now();
    const timestamp = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // Stage 1: Append User Message immediately
    setChatHistory((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', text: promptPreset.query, time: timestamp },
    ]);

    // Stage 2: Grounding Step-by-Step Chain of Thought
    setAiState('grounding');
    setActiveGroundingStep(
      promptPreset.groundingStep ||
        '🔍 Consulting real-time stadium sensors & WCAG AA topology data...',
    );

    // After 600ms, begin Stage 3: Token-by-Token Typewriter Streaming
    setTimeout(() => {
      setAiState('streaming');
      setStreamingText('');

      const fullText = promptPreset.fullAiResponse;
      const words = fullText.split(' ');
      let currentWordIndex = 0;

      // Append initial blank AI message to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: 'ai',
          text: '',
          badge: promptPreset.badge,
          badgeColor: promptPreset.badgeColor,
          crowdStatus: promptPreset.crowdStatus,
          audioSnippet: promptPreset.audioSnippet,
          time: timestamp,
          isStreaming: true,
          isCompleted: false,
        },
      ]);

      streamTimerRef.current = setInterval(() => {
        if (currentWordIndex < words.length) {
          const nextWord = words[currentWordIndex];
          setStreamingText((prev) => {
            const updated = prev ? `${prev} ${nextWord}` : nextWord;
            setChatHistory((history) =>
              history.map((msg) => (msg.id === aiMsgId ? { ...msg, text: updated } : msg)),
            );
            return updated;
          });
          currentWordIndex++;
        } else {
          // Stage 4: Stream Completed
          clearInterval(streamTimerRef.current);
          setAiState('completed');
          setChatHistory((history) =>
            history.map((msg) =>
              msg.id === aiMsgId ? { ...msg, isStreaming: false, isCompleted: true } : msg,
            ),
          );

          // Simultaneously append telemetry signal to Ops Command Center
          setOpsFeed((prev) => [
            {
              id: Date.now(),
              time: 'Just now',
              query: promptPreset.query,
              lang: promptPreset.lang || 'AUTO',
              impact: `Live LLM token response generated (${words.length} words · Grounded via Gemini 2.5 Flash)`,
            },
            ...prev.slice(0, 4),
          ]);
        }
      }, TIMINGS.SIM_TYPEWRITER_SPEED);
    }, TIMINGS.SIM_GROUNDING_DELAY);
  }, []);

  /**
   * Handles preset prompt tap from the simulator grid.
   * @param {number} index - Index of the selected prompt
   */
  function handleSelectPrompt(index) {
    if (aiState === 'grounding' || aiState === 'streaming') return;
    triggerLlmGeneration(SIMULATOR_PROMPTS[index], index);
  }

  /**
   * Handles custom query submission.
   * @param {Event} [e] - Form submit event
   */
  function handleCustomSubmit(e) {
    e?.preventDefault();
    if (!customInput.trim() || aiState === 'grounding' || aiState === 'streaming') return;

    const q = customInput.trim();
    setCustomInput('');

    triggerLlmGeneration(
      {
        id: 'custom-' + Date.now(),
        lang: 'EN',
        langName: 'Detected (EN/Multilingual)',
        icon: Sparkles,
        query: q,
        groundingStep:
          '🔍 Grounding with MetLife Stadium 3D architectural model & live concourse cameras...',
        fullAiResponse:
          'Based on MetLife Stadium live telemetry: Your requested destination is open and accessible right now. Follow the green overhead signage to Concourse Level 2. Estimated travel time: ~4 mins with minimal foot traffic.',
        badge: '⚡ Live Grounded Answer',
        badgeColor: 'emerald',
        crowdStatus: 'Optimal Route Calculated',
        audioSnippet: 'Responded instantly via Gemini 2.5 Flash',
      },
      null,
    );
  }

  /**
   * Handles audio readout simulation.
   * @param {string} msgId - Message ID to play audio for
   */
  function handlePlayAudio(msgId) {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), TIMINGS.AUDIO_PLAYBACK_MOCK);
    }
  }

  /**
   * Handles like / grounded feedback toggle.
   * @param {string} msgId - Message ID to toggle like on
   */
  function handleLikeMessage(msgId) {
    setLikedMessageIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  }

  return {
    // State
    activeTab,
    setActiveTab,
    activeScenarioIndex,
    customInput,
    setCustomInput,
    opsFeed,
    surgeActive,
    setSurgeActive,
    aiState,
    activeGroundingStep,
    streamingText,
    playingAudioId,
    likedMessageIds,
    chatHistory,
    chatScrollRef,

    // Handlers
    handleSelectPrompt,
    handleCustomSubmit,
    handlePlayAudio,
    handleLikeMessage,
  };
}
