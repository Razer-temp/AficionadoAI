/**
 * LandingPage — Composition root for the Aficionado AI landing page.
 * Orchestrates all sub-components: navigation, hero, interactive simulator,
 * feature grid, how-it-works, join event, FAQ, and footer.
 *
 * Each section is extracted into a focused, single-responsibility component.
 * Simulator state is managed via the useLandingSimulator custom hook.
 * @module LandingPage
 */

import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Smartphone, Monitor } from 'lucide-react';

import { useLandingSimulator } from '../../hooks/useLandingSimulator';
import LandingNav from './LandingNav';
import HeroSection from './HeroSection';
import FanSimulator from './FanSimulator';
import OpsSimulator from './OpsSimulator';
import FeatureGrid from './FeatureGrid';
import HowItWorks from './HowItWorks';
import JoinEventSection from './JoinEventSection';
import FAQAccordion from './FAQAccordion';
import FooterSection from './FooterSection';
import '../../styles/landing.css';

/**
 * Main Landing Page component — thin composition layer.
 * @returns {JSX.Element}
 */
function LandingPage() {
  const navigate = useNavigate();
  const simulator = useLandingSimulator();

  // Section refs for scroll navigation
  const joinRef = useRef(null);
  const simulatorRef = useRef(null);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const faqRef = useRef(null);

  /** Smoothly scrolls to a section ref. */
  function scrollToSection(ref) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Shorthand scroll callbacks. */
  const scrollToJoin = () => scrollToSection(joinRef);
  const scrollToSimulator = () => scrollToSection(simulatorRef);

  return (
    <div className="landing">
      {/* Navigation */}
      <LandingNav
        refs={{ simulator: simulatorRef, features: featuresRef, how: howRef, faq: faqRef, join: joinRef }}
        onNavigate={navigate}
        scrollToSection={scrollToSection}
      />

      {/* Hero */}
      <HeroSection
        scrollToJoin={scrollToJoin}
        scrollToSimulator={scrollToSimulator}
        onNavigate={navigate}
      />

      {/* Interactive Simulator */}
      <section
        className="landing-section landing-simulator-section"
        ref={simulatorRef}
        id="interactive-demo"
      >
        <div className="landing-section-header">
          <div className="landing-section-badge">
            <Sparkles size={13} />
            <span>Live Interactive Simulator</span>
          </div>
          <h2 className="landing-section-title">
            Experience both sides of the stadium intelligence loop
          </h2>
          <p className="landing-section-desc">
            Test the fan experience on our Titanium iPhone 16 Pro mockup (synchronized exactly to
            your device clock), or switch to the Ops Command Center to see how every inquiry
            converts into actionable telemetry.
          </p>
        </div>

        {/* Persona Mode Switcher */}
        <div className="landing-sim-tabs">
          <button
            className={`landing-sim-tab ${simulator.activeTab === 'fan' ? 'landing-sim-tab--active' : ''}`}
            onClick={() => simulator.setActiveTab('fan')}
          >
            <Smartphone size={18} />
            <span>📱 Fan AI Concierge (Titanium iPhone Mockup)</span>
          </button>
          <button
            className={`landing-sim-tab ${simulator.activeTab === 'ops' ? 'landing-sim-tab--active' : ''}`}
            onClick={() => simulator.setActiveTab('ops')}
          >
            <Monitor size={18} />
            <span>🖥️ Ops Command Center (Live Sync)</span>
          </button>
        </div>

        {/* Simulator Content */}
        <div className="landing-sim-container glass-card">
          {simulator.activeTab === 'fan' ? (
            <FanSimulator simulator={simulator} onNavigate={navigate} />
          ) : (
            <OpsSimulator
              opsFeed={simulator.opsFeed}
              surgeActive={simulator.surgeActive}
              setSurgeActive={simulator.setSurgeActive}
              onNavigate={navigate}
            />
          )}
        </div>
      </section>

      {/* Capabilities Grid */}
      <FeatureGrid sectionRef={featuresRef} />

      {/* How It Works */}
      <HowItWorks sectionRef={howRef} onNavigate={navigate} scrollToJoin={scrollToJoin} />

      {/* Join Event */}
      <JoinEventSection sectionRef={joinRef} onNavigate={navigate} />

      {/* FAQ */}
      <FAQAccordion sectionRef={faqRef} />

      {/* Footer */}
      <FooterSection onNavigate={navigate} scrollToSimulator={scrollToSimulator} />
    </div>
  );
}

export default LandingPage;
