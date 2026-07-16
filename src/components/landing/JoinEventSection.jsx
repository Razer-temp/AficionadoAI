import PropTypes from 'prop-types';
/**
 * JoinEventSection — Event join form with quick demo buttons and direct links.
 * @module JoinEventSection
 */

import { useState } from 'react';
import {
  Ticket,
  Link2,
  ArrowRight,
  AlertCircle,
  Smartphone,
  Monitor,
  Settings,
} from 'lucide-react';

/**
 * Event join section with quick demo stadiums, custom link input, and direct persona links.
 * @param {{ sectionRef: import('react').RefObject, onNavigate: Function }} props
 * @returns {JSX.Element}
 */
function JoinEventSection({ sectionRef, onNavigate }) {
  const [eventInput, setEventInput] = useState('');
  const [joinError, setJoinError] = useState(null);

  /**
   * Handles manual join form submission.
   * @param {Event} e - Form submit event
   */
  function handleJoinEvent(e) {
    e.preventDefault();
    setJoinError(null);

    const input = eventInput.trim();
    if (!input) return;

    let slug = input;
    if (input.includes('/event/')) {
      const match = input.match(/\/event\/([^/?\s]+)/);
      if (match) {
        slug = match[1];
      }
    }
    slug = slug.replace(/^\/+|\/+$/g, '');

    if (!slug) {
      setJoinError('Please enter a valid event link or slug (e.g. metlife-opener)');
      return;
    }

    onNavigate(`/event/${slug}`);
  }

  return (
    <section className="landing-join" ref={sectionRef} id="join">
      <div className="landing-join-card">
        <div className="landing-join-badge">
          <Ticket size={14} className="text-emerald" />
          <span>Instant Access Gate</span>
        </div>
        <h2 className="landing-join-title">Ready to enter the stadium?</h2>
        <p className="landing-join-desc">
          Paste an event invite link, enter an event slug, or click one of our one-click live demo
          stadiums below to experience Aficionado AI immediately.
        </p>

        {/* Hackathon Evaluator Tip Banner */}
        <div className="landing-evaluator-tip">
          <span className="landing-evaluator-tip-icon">💡</span>
          <div className="landing-evaluator-tip-text">
            <strong className="landing-evaluator-tip-title">
              Hackathon Evaluator & Judge Pro-Tip:
            </strong>
            Click <b>MetLife Stadium Opener</b> below to test{' '}
            <em>
              Secure Gated Access & Claim Code Verification (
              <code className="landing-evaluator-code">FAN-2026</code>)
            </em>
            , or click <b>World Cup Final 2026</b> to test{' '}
            <em>Instant 0-Click VIP Entry</em> directly into the 4-Language AI Concierge!
          </div>
        </div>

        {/* Quick Demo Buttons */}
        <div className="landing-quick-demos">
          <div className="landing-quick-demos-label">
            <span className="text-cyan">⚡</span> One-Click Instant Demo Stadiums:
          </div>
          <div className="landing-quick-demos-grid">
            <button
              className="landing-quick-demo-btn landing-quick-demo-btn--blue"
              onClick={() => onNavigate('/event/metlife-opener')}
            >
              <div className="landing-quick-demo-inner">
                <div className="landing-quick-demo-icon landing-quick-demo-icon--blue">⚽</div>
                <div className="landing-quick-demo-content">
                  <div className="landing-quick-demo-title-row">
                    <strong>MetLife Stadium Opener</strong>
                    <span className="landing-quick-demo-live-badge landing-quick-demo-live-badge--green">
                      <span className="landing-quick-demo-live-dot" /> Live
                    </span>
                  </div>
                  <div className="landing-quick-demo-desc">
                    Gated Access Demo · Time Window + Claim Code Verification (
                    <code className="text-cyan font-bold">FAN-2026</code>)
                  </div>
                  <div className="landing-quick-demo-tags">
                    <span className="landing-quick-demo-tag">🛡️ Gated Flow</span>
                    <span className="landing-quick-demo-tag">🌐 4L AI Concierge</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="landing-quick-demo-arrow text-cyan" />
            </button>

            <button
              className="landing-quick-demo-btn landing-quick-demo-btn--gold"
              onClick={() => onNavigate('/event/fifa-final-2026')}
            >
              <div className="landing-quick-demo-inner">
                <div className="landing-quick-demo-icon landing-quick-demo-icon--gold">🏆</div>
                <div className="landing-quick-demo-content">
                  <div className="landing-quick-demo-title-row">
                    <strong>World Cup Final 2026</strong>
                    <span className="landing-quick-demo-live-badge landing-quick-demo-live-badge--gold">
                      ★ VIP Ready
                    </span>
                  </div>
                  <div className="landing-quick-demo-desc">
                    Instant 0-Click Pass · Drops directly into 3D Topology Navigation &
                    Priority Lanes
                  </div>
                  <div className="landing-quick-demo-tags">
                    <span className="landing-quick-demo-tag">⚡ 0-Click Entry</span>
                    <span className="landing-quick-demo-tag">♿ WCAG AA Grounded</span>
                  </div>
                </div>
              </div>
              <ArrowRight size={20} className="landing-quick-demo-arrow text-gold" />
            </button>
          </div>
        </div>

        <form className="landing-join-input-row" onSubmit={handleJoinEvent}>
          <div className="landing-join-input-wrapper">
            <Link2 size={18} className="landing-join-input-icon" />
            <input
              type="text"
              className="landing-join-input"
              value={eventInput}
              onChange={(e) => {
                setEventInput(e.target.value);
                setJoinError(null);
              }}
              placeholder="Paste event link or slug (e.g. metlife-opener)..."
              autoComplete="off"
              aria-label="Event link or slug"
            />
          </div>
          <button type="submit" className="landing-join-btn" disabled={!eventInput.trim()}>
            <span>Join Match</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {joinError && (
          <div className="landing-join-error" role="alert">
            <AlertCircle size={15} />
            <span>{joinError}</span>
          </div>
        )}

        <div className="landing-join-divider">or explore direct system views</div>

        <div className="landing-join-direct-links">
          <button className="landing-join-direct-btn" onClick={() => onNavigate('/fan')}>
            <Smartphone size={15} className="text-emerald" />
            <span>Fan Concierge Demo</span>
          </button>
          <button className="landing-join-direct-btn" onClick={() => onNavigate('/ops')}>
            <Monitor size={15} className="text-cyan" />
            <span>Ops Command Center</span>
          </button>
          <button className="landing-join-direct-btn" onClick={() => onNavigate('/organizer')}>
            <Settings size={15} className="text-gold" />
            <span>Organizer Console</span>
          </button>
        </div>
      </div>
    </section>
  );
}


JoinEventSection.propTypes = {
  sectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onNavigate: PropTypes.func.isRequired,
};

export default JoinEventSection;
