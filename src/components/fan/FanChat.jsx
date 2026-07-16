import PropTypes from 'prop-types';
import { useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import LanguageBadge from './LanguageBadge';
import { useFanChat } from '../../hooks/useFanChat';
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
    className: 'starter-icon-wayfinding',
  },
  {
    text: 'Transit from Manhattan?',
    category: 'Transit Corridor',
    query: 'How do I get to the stadium using public transit from Manhattan?',
    icon: Train,
    className: 'starter-icon-transit',
  },
  {
    text: 'Wheelchair Entrances?',
    category: 'ADA & Safety',
    query: 'Where are the wheelchair accessible entrances and drop-off zones?',
    icon: Accessibility,
    className: 'starter-icon-ada',
  },
  {
    text: 'Bag & Water Policy?',
    category: 'Stadium Policy',
    query: 'What is the bag policy? Can I bring a water bottle into MetLife?',
    icon: Briefcase,
    className: 'starter-icon-policy',
  },
  {
    text: 'Halal Food Options?',
    category: 'Dining & Food',
    query: 'Where can I find halal food options in the stadium concourses?',
    icon: Utensils,
    className: 'starter-icon-dining',
  },
  {
    text: '¿Dónde está la puerta A?',
    category: 'Multilingual',
    query: '¿Dónde está la puerta A?',
    icon: Globe,
    className: 'starter-icon-lang',
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
  const {
    messages,
    input,
    setInput,
    isLoading,
    language,
    error,
    handleSend,
  } = useFanChat({ onQueryLog });

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
              <span className="telemetry-dot-separator">•</span>
              <span className="telemetry-lang-count">
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
              <div className="section-heading-pill section-heading-pill-light">
                <HelpCircle size={15} className="text-gold" />
                <span>Quick Prompts</span>
              </div>
              <div className="chat-starters">
                {STARTER_QUESTIONS.map((q, idx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="starter-btn"
                      onClick={() => handleSend(q.query)}
                      aria-label={`Ask: ${q.text}`}
                    >
                      <div
                        className={`starter-icon-box ${q.className}`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="starter-content">
                        <span className="starter-cat">{q.category}</span>
                        <span className="starter-text">{q.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="chat-history">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Chat Input Dock */}
      <footer className="chat-input-dock">
        <div className="chat-input-container glass-card">
          <div className="chat-input-row">
            {language && language !== 'en' && <LanguageBadge language={language} />}
            <div className="chat-input-wrapper">
              <label htmlFor="chat-input" className="sr-only">
                Ask a question
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
            className="chat-disclaimer flex-align chat-disclaimer-centered"
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


FanChat.propTypes = {
  onQueryLog: PropTypes.func,
};

export default FanChat;
