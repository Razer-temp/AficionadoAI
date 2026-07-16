/**
 * Custom hook for managing the state and logic of the Fan AI Concierge chat.
 * @module useFanChat
 */

import { useState, useCallback } from 'react';
import { sendChatMessage, detectLanguage } from '../services/geminiChat';
import { formatErrorResponse } from '../utils/errors';

/** Helper to extract a zone hint from query for telemetry logging */
function extractZone(query) {
  const lower = query.toLowerCase();
  if (lower.includes('gate a') || lower.includes('metlife gate') || lower.includes('puerta a'))
    return 'gate-a';
  if (lower.includes('gate b') || lower.includes('verizon') || lower.includes('puerta b'))
    return 'gate-b';
  if (lower.includes('gate c') || lower.includes('hcltech') || lower.includes('puerta c'))
    return 'gate-c';
  if (lower.includes('gate d') || lower.includes('moody') || lower.includes('puerta d'))
    return 'gate-d';
  if (lower.includes('100 level') || lower.includes('lower')) return 'concourse-100';
  if (lower.includes('200 level') || lower.includes('mezzanine')) return 'concourse-200';
  if (lower.includes('300 level') || lower.includes('upper')) return 'concourse-300';
  return null;
}

export function useFanChat({ onQueryLog, crowdData = null, userContext = {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);

  const handleSend = useCallback(
    async (messageText) => {
      const text = messageText || input.trim();
      if (!text || isLoading) return;

      setInput('');
      setError(null);

      // Detect language for badge
      const detectedLang = detectLanguage(text);
      setLanguage(detectedLang);

      // Add user message
      const userMessage = { role: 'user', text, timestamp: Date.now() };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build history for context (last 10 messages)
        const history = messages.slice(-10).map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

        const result = await sendChatMessage(text, history, crowdData, userContext);

        if (result.success) {
          const assistantMessage = {
            role: 'assistant',
            text: result.data.response,
            language: result.data.language,
            sources: result.data.sources,
            cached: result.data.cached,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Log anonymized query to ops feed
          if (onQueryLog) {
            onQueryLog({
              language: result.data.language,
              intentCategory: result.data.intents?.[0] || 'general',
              zone: extractZone(text),
              queryPreview: text.slice(0, 50),
            });
          }
        }
      } catch (err) {
        const formatted = formatErrorResponse(err);
        setError(formatted.error.message);
        const errorMessage = {
          role: 'assistant',
          text: `I apologize, but I encountered an issue: ${formatted.error.message}. Please try again.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, onQueryLog, crowdData, userContext],
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    language,
    error,
    handleSend,
  };
}
