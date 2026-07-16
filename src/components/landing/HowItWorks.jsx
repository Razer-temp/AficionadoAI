import PropTypes from 'prop-types';
/**
 * HowItWorks — Interactive 3-step workflow walkthrough with live previews.
 * @module HowItWorks
 */

import { useState } from 'react';
import {
  Radio,
  Settings,
  QrCode,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { STEPS } from './landingData';

/**
 * Interactive "How It Works" section with step tabs and live preview box.
 * @param {{ sectionRef: import('react').RefObject, onNavigate: Function, scrollToJoin: Function }} props
 * @returns {JSX.Element}
 */
function HowItWorks({ sectionRef, onNavigate, scrollToJoin }) {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="landing-section" ref={sectionRef} id="how-it-works">
      <div className="landing-section-header">
        <div className="landing-section-badge">
          <Radio size={13} />
          <span>Interactive Workflow</span>
        </div>
        <h2 className="landing-section-title">
          From event creation to live fan experience in 3 steps
        </h2>
        <p className="landing-section-desc">
          Tap any step below to see how simple and powerful Aficionado AI is for organizers and
          stadium guests.
        </p>
      </div>

      <div className="landing-steps">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.number;
          return (
            <div
              key={step.number}
              className={`landing-step ${isActive ? 'landing-step--active' : ''}`}
              onClick={() => setActiveStep(step.number)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveStep(step.number);
                }
              }}
            >
              <div className="landing-step-top">
                <div className="landing-step-number">{step.number}</div>
                <Icon size={24} className="landing-step-icon" />
              </div>
              <h3 className="landing-step-title">{step.title}</h3>
              <p className="landing-step-desc">{step.desc}</p>
              <button className="landing-step-tap-hint">
                <span>{isActive ? 'Currently Showing Below 👇' : 'Tap to Preview Step'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Live Step Preview Box */}
      <div className="landing-step-preview-box glass-card">
        <div className="landing-step-preview-header">
          <span className="telemetry-pill text-cyan">{STEPS[activeStep - 1].previewBadge}</span>
          <h4 className="landing-step-preview-title">{STEPS[activeStep - 1].previewTitle}</h4>
        </div>
        <p className="landing-step-preview-text">{STEPS[activeStep - 1].previewContent}</p>

        <div className="landing-step-preview-actions">
          {activeStep === 1 && (
            <button className="landing-cta-primary" onClick={() => onNavigate('/organizer')}>
              <Settings size={16} />
              <span>Open Organizer Portal (/organizer)</span>
            </button>
          )}
          {activeStep === 2 && (
            <button className="landing-cta-primary" onClick={scrollToJoin}>
              <QrCode size={16} />
              <span>Test Instant Link Join Below</span>
            </button>
          )}
          {activeStep === 3 && (
            <div className="flex-align gap-3 flex-wrap">
              <button className="landing-cta-primary" onClick={() => onNavigate('/fan')}>
                <Smartphone size={16} />
                <span>Launch Fan Concierge (/fan)</span>
              </button>
              <button className="landing-cta-secondary" onClick={() => onNavigate('/ops')}>
                <Monitor size={16} />
                <span>Launch Ops Console (/ops)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


HowItWorks.propTypes = {
  sectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onNavigate: PropTypes.func.isRequired,
  scrollToJoin: PropTypes.func.isRequired,
};

export default HowItWorks;
