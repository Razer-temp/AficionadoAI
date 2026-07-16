import PropTypes from 'prop-types';
/**
 * LandingNav — Desktop and mobile navigation bar for the landing page.
 * Includes scroll-aware background, mobile hamburger drawer, and persona demos.
 * @module LandingNav
 */

import { useState, useEffect } from 'react';
import {
  Ticket,
  Menu,
  X,
  Sparkles,
  Zap,
  Radio,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Monitor,
  Settings,
} from 'lucide-react';

/**
 * Landing page navigation with desktop links and mobile glass drawer.
 * @param {{ refs: object, onNavigate: Function, scrollToSection: Function }} props
 * @returns {JSX.Element}
 */
function LandingNav({ refs, onNavigate, scrollToSection }) {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track scroll for nav background
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  /** Scrolls to a section and closes the mobile menu. */
  function scrollAndClose(ref) {
    setMobileMenuOpen(false);
    scrollToSection(ref);
  }

  return (
    <>
      <nav className={`landing-nav ${navScrolled ? 'landing-nav--scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <button
            type="button"
            className="landing-nav-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
          >
            <img src="/logo.svg" alt="Aficionado AI" className="landing-nav-logo" />
            <span className="landing-nav-name">
              <span className="gradient-text">Aficionado</span> AI
            </span>
          </button>

          {/* Desktop Nav Links */}
          <ul className="landing-nav-links">
            <li>
              <button className="landing-nav-link" onClick={() => scrollAndClose(refs.simulator)}>
                Interactive Demo
              </button>
            </li>
            <li>
              <button className="landing-nav-link" onClick={() => scrollAndClose(refs.features)}>
                Capabilities
              </button>
            </li>
            <li>
              <button className="landing-nav-link" onClick={() => scrollAndClose(refs.how)}>
                How It Works
              </button>
            </li>
            <li>
              <button className="landing-nav-link" onClick={() => scrollAndClose(refs.faq)}>
                FAQ
              </button>
            </li>
            <li>
              <button className="landing-nav-link" onClick={() => onNavigate('/organizer')}>
                For Organizers
              </button>
            </li>
          </ul>

          <div className="landing-nav-actions">
            <button
              className="landing-cta-primary landing-nav-cta landing-nav-cta--desktop"
              onClick={() => scrollAndClose(refs.join)}
            >
              <Ticket size={14} />
              <span>Join Event</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="landing-nav-mobile-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Glass Drawer */}
      {mobileMenuOpen && (
        <div className="landing-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
          <div className="landing-mobile-drawer-header">
            <button
              type="button"
              className="landing-nav-brand"
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="Scroll to top"
            >
              <img src="/logo.svg" alt="Aficionado AI" className="landing-nav-logo" />
              <span className="landing-nav-name">
                <span className="gradient-text">Aficionado</span> AI
              </span>
            </button>
            <button
              className="landing-nav-mobile-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="landing-mobile-drawer-content">
            <div className="landing-mobile-nav-group">
              <div className="landing-mobile-nav-label">Navigation</div>
              <button
                className="landing-mobile-nav-item"
                onClick={() => scrollAndClose(refs.simulator)}
              >
                <Sparkles size={18} className="text-cyan" />
                <span>Interactive Simulator</span>
                <ChevronRight size={16} />
              </button>
              <button
                className="landing-mobile-nav-item"
                onClick={() => scrollAndClose(refs.features)}
              >
                <Zap size={18} className="text-emerald" />
                <span>AI Capabilities</span>
                <ChevronRight size={16} />
              </button>
              <button
                className="landing-mobile-nav-item"
                onClick={() => scrollAndClose(refs.how)}
              >
                <Radio size={18} className="text-gold" />
                <span>How It Works (3 Steps)</span>
                <ChevronRight size={16} />
              </button>
              <button
                className="landing-mobile-nav-item"
                onClick={() => scrollAndClose(refs.faq)}
              >
                <HelpCircle size={18} className="text-cyan" />
                <span>Frequently Asked Questions</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="landing-mobile-nav-group">
              <div className="landing-mobile-nav-label">Live Persona Demos</div>
              <button
                className="landing-mobile-demo-card"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/fan');
                }}
              >
                <div className="landing-mobile-demo-icon bg-emerald-dim">
                  <Smartphone size={20} />
                </div>
                <div className="landing-mobile-demo-info">
                  <strong>Fan Concierge View</strong>
                  <span>Try the mobile stadium AI assistant</span>
                </div>
              </button>
              <button
                className="landing-mobile-demo-card"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/ops');
                }}
              >
                <div className="landing-mobile-demo-icon bg-cyan-dim">
                  <Monitor size={20} />
                </div>
                <div className="landing-mobile-demo-info">
                  <strong>Ops Command Center</strong>
                  <span>Live telemetry & crowd heatmaps</span>
                </div>
              </button>
              <button
                className="landing-mobile-demo-card"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('/organizer');
                }}
              >
                <div className="landing-mobile-demo-icon bg-purple-dim">
                  <Settings size={20} />
                </div>
                <div className="landing-mobile-demo-info">
                  <strong>Organizer Console</strong>
                  <span>Create & manage stadium events</span>
                </div>
              </button>
            </div>

            <div className="landing-mobile-drawer-footer">
              <button
                className="landing-cta-primary w-full justify-center"
                onClick={() => scrollAndClose(refs.join)}
              >
                <Ticket size={18} />
                <span>Join Event with Link / QR</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


LandingNav.propTypes = {
  refs: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
  scrollToSection: PropTypes.func.isRequired,
};

export default LandingNav;
