import PropTypes from 'prop-types';
/**
 * FanSimulator — Interactive iPhone mockup with 4-stage LLM streaming simulation.
 * Shows the fan-facing AI concierge experience with chat history and prompt deck.
 * @module FanSimulator
 */

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Volume2,
  ArrowRight,
  CheckCircle2,
  Activity,
  ThumbsUp,
  Wifi,
  Battery,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SIMULATOR_PROMPTS } from './landingData';

/**
 * Fan simulator with iPhone mockup, chat history, and scenario showcase deck.
 * @param {{ simulator: object, onNavigate: Function }} props
 * @returns {JSX.Element}
 */
function FanSimulator({ simulator, onNavigate }) {
  const [deviceTime, setDeviceTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  );

  // Sync device clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDeviceTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const {
    activeScenarioIndex,
    customInput,
    setCustomInput,
    aiState,
    activeGroundingStep,
    playingAudioId,
    likedMessageIds,
    chatHistory,
    chatScrollRef,
    handleSelectPrompt,
    handleCustomSubmit,
    handlePlayAudio,
    handleLikeMessage,
  } = simulator;

  return (
    <div className="landing-sim-fan-layout">
      {/* TIER 1: TITANIUM iPHONE 16 PRO MOCKUP */}
      <div className="landing-sim-phone-frame">
        <div className="landing-sim-phone-glare" aria-hidden="true" />

        {/* iOS Top Status Bar */}
        <div className="landing-sim-phone-topbar">
          <span className="landing-sim-time" title="Synced to your live device clock">
            {deviceTime}
          </span>
          <div className="landing-sim-dynamic-island">
            {aiState === 'idle' && (
              <span className="flex-align gap-1 text-xs text-emerald font-bold">
                <span className="landing-sim-phone-live-dot" /> MetLife Live
              </span>
            )}
            {aiState === 'grounding' && (
              <span className="flex-align gap-1 text-xs text-gold">
                <span className="pulse-icon">⚡</span> Grounding Venue...
              </span>
            )}
            {aiState === 'streaming' && (
              <span className="flex-align gap-1 text-xs text-cyan font-bold">
                <span className="pulse-icon">✨</span> Gemini Generating...
              </span>
            )}
            {aiState === 'completed' && (
              <span className="flex-align gap-1 text-xs text-emerald font-bold">
                <CheckCircle2 size={12} /> Response Grounded
              </span>
            )}
          </div>
          <div className="landing-sim-icons">
            <Wifi size={13} />
            <Battery size={14} />
          </div>
        </div>

        {/* Stadium App Header */}
        <div className="landing-sim-phone-header">
          <div className="flex-align gap-2">
            <span className="landing-sim-phone-live-dot" />
            <strong>MetLife Stadium · World Cup 2026</strong>
          </div>
          <span className="landing-sim-phone-lang-badge">4L Auto-Detect</span>
        </div>

        {/* Continuous Scrollable Chat History */}
        <div className="landing-sim-phone-screen" ref={chatScrollRef}>
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`landing-sim-msg ${msg.role === 'user' ? 'landing-sim-msg--user' : 'landing-sim-msg--ai'}`}
            >
              {msg.role === 'user' ? (
                <>
                  <span className="landing-sim-msg-user-icon">
                    <MessageSquare size={14} />
                  </span>
                  <div>
                    <p>{msg.text}</p>
                    <span className="landing-sim-msg-time">{msg.time}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="landing-sim-msg-ai-header">
                    <span className="landing-sim-ai-avatar">⚡</span>
                    <strong>Aficionado Concierge</strong>
                    <span className="landing-sim-ai-tag">Grounded in Venue Topology</span>
                  </div>

                  <div className="landing-sim-ai-content">
                    <p className="landing-sim-text-content">
                      {msg.text}
                      {msg.isStreaming && <span className="landing-sim-cursor">|</span>}
                    </p>

                    {msg.isCompleted && msg.badge && (
                      <div className="landing-sim-ai-meta">
                        <span className={`landing-sim-ai-badge bg-${msg.badgeColor}`}>
                          {msg.badge}
                        </span>
                        <span className="landing-sim-ai-crowd">
                          <Activity size={13} />
                          {msg.crowdStatus}
                        </span>
                      </div>
                    )}

                    {msg.isCompleted && msg.audioSnippet && (
                      <div className="landing-sim-ai-actions">
                        <button
                          className={`landing-sim-audio-btn ${playingAudioId === msg.id ? 'landing-sim-audio-btn--playing' : ''}`}
                          onClick={() => handlePlayAudio(msg.id)}
                        >
                          <Volume2 size={13} />
                          <span>
                            {playingAudioId === msg.id
                              ? '🔊 Playing Audio Readout...'
                              : `Read Aloud (${msg.audioSnippet.split(' ')[2] || 'EN'})`}
                          </span>
                        </button>
                        <button
                          className={`landing-sim-like-btn ${likedMessageIds[msg.id] ? 'landing-sim-like-btn--active' : ''}`}
                          onClick={() => handleLikeMessage(msg.id)}
                          title="Grounded Verified Accurate"
                        >
                          <ThumbsUp size={13} />
                          <span>{likedMessageIds[msg.id] ? 'Verified' : 'Verify'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Grounding Chain of Thought Capsule */}
          {aiState === 'grounding' && (
            <div className="landing-sim-grounding-capsule">
              <span className="pulse-icon">⚡</span>
              <span>{activeGroundingStep}</span>
            </div>
          )}
        </div>

        {/* Prompt Selection Grid */}
        <div className="landing-sim-chips-grid-wrapper">
          <div className="landing-sim-chips-label">💡 Tap Quick Prompts:</div>
          <div className="landing-sim-chips-2col-grid">
            {SIMULATOR_PROMPTS.map((p, idx) => (
              <button
                key={p.id}
                className={`landing-sim-grid-pill ${activeScenarioIndex === idx ? 'landing-sim-grid-pill--active' : ''}`}
                onClick={() => handleSelectPrompt(idx)}
                disabled={aiState === 'grounding' || aiState === 'streaming'}
              >
                <span className="landing-sim-chip-lang">{p.lang}</span>
                <span className="landing-sim-chip-text">{p.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Question Input */}
        <form className="landing-sim-phone-input-row" onSubmit={handleCustomSubmit}>
          <input
            type="text"
            className="landing-sim-phone-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type custom query (e.g. Gate B restrooms)..."
            disabled={aiState === 'grounding' || aiState === 'streaming'}
          />
          <button
            type="submit"
            className="landing-sim-phone-send"
            disabled={!customInput.trim() || aiState === 'grounding' || aiState === 'streaming'}
            aria-label="Send message"
          >
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="landing-sim-phone-footer">
          <button className="landing-sim-try-live-btn" onClick={() => onNavigate('/fan')}>
            <span>Open Full Mobile App (/fan)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* TIER 2: Scenario Showcase Deck */}
      <div className="landing-sim-showcase-deck">
        <div className="landing-showcase-header">
          <div className="flex-align gap-2">
            <Layers size={18} className="text-cyan" />
            <span className="text-sm font-bold text-cyan uppercase tracking-wider">
              Interactive Showcase Deck
            </span>
          </div>
          <h3 className="landing-showcase-title">Test Drive 4 Multilingual AI Scenarios</h3>
          <p className="landing-showcase-subtitle">
            Click any scenario card below to trigger real-time chain-of-thought grounding
            and token-by-token streaming right inside the Titanium iPhone on the left.
          </p>
        </div>

        <div className="landing-scenario-cards-list">
          {SIMULATOR_PROMPTS.map((prompt, idx) => {
            const Icon = prompt.icon;
            const isActive = activeScenarioIndex === idx;
            return (
              <div
                key={prompt.id}
                className={`landing-scenario-card ${isActive ? 'landing-scenario-card--active' : ''}`}
                onClick={() => handleSelectPrompt(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPrompt(idx);
                  }
                }}
              >
                <div className="landing-scenario-card-top">
                  <span className="landing-scenario-lang-badge">
                    <span className="text-base">{prompt.flag}</span>
                    <strong>{prompt.lang}</strong>
                  </span>
                  <span className="landing-scenario-category">
                    <Icon size={14} />
                    <span>{prompt.category}</span>
                  </span>
                </div>

                <p className="landing-scenario-query">&quot;{prompt.query}&quot;</p>

                <div className="landing-scenario-card-bottom">
                  <span className={`landing-scenario-status text-${prompt.badgeColor}`}>
                    {isActive && (aiState === 'grounding' || aiState === 'streaming') ? (
                      <span className="flex-align gap-1">
                        <span className="pulse-icon">⚡</span> Streaming Live...
                      </span>
                    ) : (
                      <span>{prompt.badge}</span>
                    )}
                  </span>
                  <button
                    className="landing-scenario-launch-btn"
                    disabled={aiState === 'grounding' || aiState === 'streaming'}
                  >
                    <span>Launch Test</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="landing-showcase-footer-note">
          <Sparkles size={14} className="text-gold" />
          <span>
            Notice how every query automatically feeds operations telemetry to the Command
            Center in real time.
          </span>
        </div>
      </div>
    </div>
  );
}


FanSimulator.propTypes = {
  simulator: PropTypes.shape({
    activeScenarioIndex: PropTypes.number.isRequired,
    customInput: PropTypes.string.isRequired,
    setCustomInput: PropTypes.func.isRequired,
    aiState: PropTypes.string.isRequired,
    activeGroundingStep: PropTypes.string.isRequired,
    playingAudioId: PropTypes.string,
    likedMessageIds: PropTypes.object.isRequired,
    chatHistory: PropTypes.array.isRequired,
    chatScrollRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    handleSelectPrompt: PropTypes.func.isRequired,
    handleCustomSubmit: PropTypes.func.isRequired,
    handlePlayAudio: PropTypes.func.isRequired,
    handleLikeMessage: PropTypes.func.isRequired,
  }).isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default FanSimulator;
