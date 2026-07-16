import PropTypes from 'prop-types';
/**
 * HeroSection — Landing page hero with headline, CTAs, and trust indicators.
 * @module HeroSection
 */

import {
  Ticket,
  ArrowRight,
  Play,
  Settings,
  Cpu,
  Globe,
  Smartphone,
  Lock,
} from 'lucide-react';

/**
 * Hero section with animated background, headline, CTAs, and trust badges.
 * @param {{ scrollToJoin: Function, scrollToSimulator: Function, onNavigate: Function }} props
 * @returns {JSX.Element}
 */
function HeroSection({ scrollToJoin, scrollToSimulator, onNavigate }) {
  return (
    <section className="landing-hero">
      <div className="landing-hero-bg" aria-hidden="true">
        <div className="landing-orb landing-orb--1" />
        <div className="landing-orb landing-orb--2" />
        <div className="landing-orb landing-orb--3" />
        <div className="landing-hero-grid" />
      </div>

      <div className="landing-hero-content">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          <span>FIFA World Cup 2026 · Smart Stadium AI Concierge</span>
        </div>

        <h1>
          The AI Concierge for <span className="gradient-text">Every Fan</span>.<br />
          The Command Center for <span className="gradient-text">Every Stadium</span>.
        </h1>

        <p className="landing-hero-sub">
          Multilingual, zero-app, grounded in live venue topology. Ask anything about gates,
          transit, food, or WCAG AA accessibility — while operations intelligence monitors crowd
          flow and alerts staff in real time.
        </p>

        <div className="landing-hero-ctas">
          <button className="landing-cta-primary" onClick={scrollToJoin}>
            <Ticket size={18} />
            <span>Enter Stadium Event</span>
            <ArrowRight size={18} />
          </button>
          <button className="landing-cta-secondary" onClick={scrollToSimulator}>
            <Play size={16} />
            <span>Test Drive Interactive AI</span>
          </button>
          <button className="landing-cta-outline" onClick={() => onNavigate('/organizer')}>
            <Settings size={16} />
            <span>I&apos;m an Organizer</span>
          </button>
        </div>

        <div className="landing-trust-row">
          <span className="landing-trust-item">
            <Cpu size={14} className="text-emerald" />
            Powered by Google Gemini 2.5 Flash
          </span>
          <span className="landing-trust-divider" />
          <span className="landing-trust-item">
            <Globe size={14} className="text-cyan" />4 Native Languages
          </span>
          <span className="landing-trust-divider" />
          <span className="landing-trust-item">
            <Smartphone size={14} className="text-gold" />
            Zero App Download (100% Web)
          </span>
          <span className="landing-trust-divider" />
          <span className="landing-trust-item">
            <Lock size={14} className="text-purple" />
            Zero PII / Anonymized Data
          </span>
        </div>
      </div>
    </section>
  );
}


HeroSection.propTypes = {
  scrollToJoin: PropTypes.func.isRequired,
  scrollToSimulator: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default HeroSection;
