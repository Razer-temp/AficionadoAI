import PropTypes from 'prop-types';
/**
 * FooterSection — Landing page footer with branding, links, and attribution.
 * @module FooterSection
 */

import { Cpu } from 'lucide-react';

/**
 * Footer with brand, navigation links, and Google attribution.
 * @param {{ onNavigate: Function, scrollToSimulator: Function }} props
 * @returns {JSX.Element}
 */
function FooterSection({ onNavigate, scrollToSimulator }) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-brand">
          <img src="/logo.svg" alt="Aficionado AI" className="landing-footer-logo" />
          <div>
            <div className="landing-footer-name">
              <span className="gradient-text">Aficionado</span> AI
            </div>
            <div className="landing-footer-tagline">
              Built for Google Prompt Wars x Hack2Skill — Challenge 4: Smart Stadiums
            </div>
          </div>
        </div>

        <div className="landing-footer-links">
          <button onClick={scrollToSimulator} className="landing-footer-link">
            Interactive Demo
          </button>
          <button onClick={() => onNavigate('/fan')} className="landing-footer-link">
            Fan Demo (/fan)
          </button>
          <button onClick={() => onNavigate('/ops')} className="landing-footer-link">
            Ops Demo (/ops)
          </button>
          <button onClick={() => onNavigate('/organizer')} className="landing-footer-link">
            Organizer (/organizer)
          </button>
        </div>

        <div className="landing-footer-powered">
          <Cpu size={14} className="text-emerald" />
          <span>Powered by Google Gemini 2.5 Flash</span>
        </div>
      </div>
    </footer>
  );
}


FooterSection.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  scrollToSimulator: PropTypes.func.isRequired,
};

export default FooterSection;
