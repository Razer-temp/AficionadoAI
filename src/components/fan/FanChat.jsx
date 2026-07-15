import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import LanguageBadge from './LanguageBadge';
import { sendChatMessage, detectLanguage } from '../../services/geminiChat';
import { formatErrorResponse } from '../../utils/errors';
import {
  Send,
  Navigation,
  Train,
  Accessibility,
  Briefcase,
  Utensils,
  Globe,
  ShieldCheck,
  Compass,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import '../../styles/fan.css';

/** Suggested starter questions with Lucide vector icons and category tags */
const STARTER_QUESTIONS = [
  {
    text: 'How do I get to Gate C?',
    category: 'Wayfinding',
    query: 'How do I get to Gate C?',
    icon: Navigation,
    color: '#00F2FE',
  },
  {
    text: 'Transit from Manhattan?',
    category: 'Transit Corridor',
    query: 'How do I get to the stadium using public transit from Manhattan?',
    icon: Train,
    color: '#10B981',
  },
  {
    text: 'Wheelchair Entrances?',
    category: 'ADA & Safety',
    query: 'Where are the wheelchair accessible entrances and drop-off zones?',
    icon: Accessibility,
    color: '#F59E0B',
  },
  {
    text: 'Bag & Water Policy?',
    category: 'Stadium Policy',
    query: 'What is the bag policy? Can I bring a water bottle into MetLife?',
    icon: Briefcase,
    color: '#4FACFE',
  },
  {
    text: 'Halal Food Options?',
    category: 'Dining & Food',
    query: 'Where can I find halal food options in the stadium concourses?',
    icon: Utensils,
    color: '#A855F7',
  },
  {
    text: '¿Dónde está la puerta A?',
    category: 'Multilingual',
    query: '¿Dónde está la puerta A?',
    icon: Globe,
    color: '#EC4899',
  },
];

/** Quick 5G AR Wayfinding passes for VIP concourse navigation */
const AR_WAYFINDING_CARDS = [
  {
    title: 'Manhattan 5G Express Pass',
    badge: '5G CORRIDOR',
    desc: 'Direct NJ Transit & LIRR express corridor schedule, arriving platforms, and live VIP transfer routing.',
    query:
      'What is the fastest transit route from Manhattan right now and where do express trains arrive at MetLife?',
  },
  {
    title: 'ADA & Sensory Routing',
    badge: 'PRIORITY ROUTE',
    desc: 'Low-sensory rooms, priority wheelchair elevators, and designated accessible gate telemetry.',
    query:
      'Where are the sensory rooms and priority accessible elevator gates located at MetLife Stadium?',
  },
  {
    title: 'Gate Wait-Time Telemetry',
    badge: 'LIVE FLOW',
    desc: 'Real-time entry flow predictions, security line speeds, and VIP express lane status across all gates.',
    query: 'Which gates currently have the lowest wait times and fastest security check right now?',
  },
];

/**
 * Main fan chat interface.
 * Immersive 5G AR Command Hub experience with message history, streaming responses,
 * language detection, interactive wayfinding telemetry cards, and floating dock input.
 * @param {{ onQueryLog: Function }} props
 * @returns {JSX.Element}
 */
function FanChat({ onQueryLog }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /** Auto-scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /** Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Sends a message through the chat pipeline.
   * @param {string} messageText - The message to send
   */
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

        const result = await sendChatMessage(text, history);

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
    [input, isLoading, messages, onQueryLog],
  );

  /** Handle keyboard submit */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="fan-chat" role="region" aria-label="Fan Chat Assistant">
      {/* Chat Messages / Welcome Dashboard */}
      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <div className="welcome-telemetry-banner">
              <span className="telemetry-dot" />
              <span className="telemetry-text">MetLife Stadium 5G Telemetry Online</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>•</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                100+ Languages Auto-Detected
              </span>
            </div>

            <h2 className="chat-welcome-title">
              Welcome to <span className="gradient-text">Aficionado AI</span>
            </h2>
            <p className="chat-welcome-text">
              Your multilingual 5G AR concierge for FIFA World Cup 2026 at MetLife Stadium. Grounded
              in live venue topology, transit schedules, security policies, and ADA accessibility!
            </p>

            {/* 5G AR Wayfinding Quick Cards */}
            <div className="ar-wayfinding-section">
              <div className="section-heading-pill">
                <Smartphone size={15} className="pulse-icon text-cyan" />
                <span>5G Express AR Wayfinding & Telemetry</span>
              </div>
              <div className="ar-cards-grid">
                {AR_WAYFINDING_CARDS.map((card, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className="ar-card"
                    onClick={() => handleSend(card.query)}
                    aria-label={`Select: ${card.title}`}
                  >
                    <div className="ar-card-header">
                      <div className="ar-card-title-wrap">
                        <Compass size={17} className="text-emerald" />
                        <span>{card.title}</span>
                      </div>
                      <span className="ar-card-badge">{card.badge}</span>
                    </div>
                    <div className="ar-card-desc">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Categorized FAQ Grid */}
            <div className="faq-section">
              <div className="section-heading-pill" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <HelpCircle size={15} className="text-gold" />
                <span>Frequently Asked Questions</span>
              </div>
              <div className="chat-starters" role="list" aria-label="Suggested questions">
                {STARTER_QUESTIONS.map((sq, i) => {
                  const IconComp = sq.icon;
                  return (
                    <div key={i} role="listitem">
                      <button
                        type="button"
                        className="starter-btn"
                        onClick={() => handleSend(sq.query)}
                        aria-label={`Ask: ${sq.query}`}
                      >
                        <div className="starter-icon-box" style={{ background: `${sq.color}18` }}>
                          <IconComp size={16} style={{ color: sq.color, flexShrink: 0 }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{sq.text}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {sq.category}
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-message-row" aria-live="polite" aria-relevant="additions">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} index={i} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Dock Input Area */}
      <footer className="chat-input-area">
        <div className="chat-input-dock">
          <div className="chat-input-row">
            <LanguageBadge language={language} />
            <div className="chat-input-wrapper">
              <label htmlFor="chat-input" className="sr-only">
                Type your question
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about gates, transit, food, policies, or accessibility..."
                maxLength={1000}
                disabled={isLoading}
                autoComplete="off"
                aria-label="Type your message to the stadium assistant"
              />
              <button
                className="chat-send-btn flex-center"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                id="chat-send-btn"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          {error && (
            <div className="chat-error" role="alert">
              ⚠️ {error}
            </div>
          )}
          <div
            className="chat-disclaimer flex-align"
            style={{ gap: '0.4rem', justifyContent: 'center' }}
          >
            <ShieldCheck size={14} className="text-emerald" />
            <span>
              Powered by Google Gemini 2.5 Flash — Responses grounded in verified MetLife venue
              knowledge base
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Extracts a generalized zone from a query for anonymized logging.
 * @param {string} query - User query text
 * @returns {string|null} Zone identifier or null
 */
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

export default FanChat;
