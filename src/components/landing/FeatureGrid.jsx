import PropTypes from 'prop-types';
/**
 * FeatureGrid — Interactive bento grid showcasing AI capabilities.
 * @module FeatureGrid
 */

import { useState } from 'react';
import { Zap, MapPin, ArrowRight } from 'lucide-react';
import { FEATURES } from './landingData';

/**
 * Bento-style feature grid with interactive micro-previews.
 * @param {{ sectionRef: import('react').RefObject }} props
 * @returns {JSX.Element}
 */
function FeatureGrid({ sectionRef }) {
  const [bentoLang, setBentoLang] = useState('ES');

  return (
    <section className="landing-section" ref={sectionRef} id="features">
      <div className="landing-section-header">
        <div className="landing-section-badge">
          <Zap size={13} />
          <span>AI-Native Capabilities</span>
        </div>
        <h2 className="landing-section-title">
          Everything attendees and operations staff need, unified
        </h2>
        <p className="landing-section-desc">
          A closed-loop system where fan assistance naturally generates anonymized operations
          telemetry — the connection IS the product.
        </p>
      </div>

      <div className="landing-bento">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={i}
              className={`landing-bento-card ${feature.wide ? 'landing-bento-card--wide' : ''}`}
            >
              <div className="landing-bento-card-top">
                <div className={`landing-bento-icon landing-bento-icon--${feature.iconStyle}`}>
                  <Icon size={22} />
                </div>
                {feature.tags && (
                  <div className="landing-bento-tags">
                    {feature.tags.map((tag, j) => (
                      <span key={j} className="landing-bento-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="landing-bento-title">{feature.title}</h3>
              <p className="landing-bento-desc">{feature.desc}</p>

              {/* Interactive Card Micro-Previews */}
              {feature.interactiveType === 'language-preview' && (
                <div className="landing-bento-interactive">
                  <div className="landing-bento-lang-tabs">
                    {['EN', 'ES', 'FR', 'PT'].map((l) => (
                      <button
                        key={l}
                        className={`landing-bento-lang-btn ${bentoLang === l ? 'landing-bento-lang-btn--active' : ''}`}
                        onClick={() => setBentoLang(l)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="landing-bento-lang-sample">
                    {bentoLang === 'EN' &&
                      '"Where is Gate B elevator?" ➔ Gate B elevator is right next to VIP Section 101.'}
                    {bentoLang === 'ES' &&
                      '"¿Dónde está el ascensor B?" ➔ El ascensor B está junto a la Sección VIP 101.'}
                    {bentoLang === 'FR' &&
                      '"Où est l\u2019ascenseur B ?" ➔ L\u2019ascenseur B est à côté de la Section VIP 101.'}
                    {bentoLang === 'PT' &&
                      '"Onde fica o elevador B?" ➔ O elevador B fica ao lado da Seção VIP 101.'}
                  </div>
                </div>
              )}

              {feature.interactiveType === 'route-preview' && (
                <div className="landing-bento-interactive landing-bento-route-pill">
                  <MapPin size={14} className="text-cyan" />
                  <span>Gate A Entrance</span>
                  <ArrowRight size={12} className="text-muted" />
                  <span>Concourse 2 Escalator</span>
                  <ArrowRight size={12} className="text-muted" />
                  <strong className="text-emerald">Section 214 (Row 8)</strong>
                </div>
              )}

              {feature.interactiveType === 'ops-preview' && (
                <div className="landing-bento-interactive landing-bento-ops-meter">
                  <div className="flex-align justify-between text-xs mb-1">
                    <span className="text-secondary">Crowd Dispersion Rate</span>
                    <strong className="text-emerald">+94% efficiency</strong>
                  </div>
                  <div className="landing-sim-gate-bar-wrap">
                    <div className="landing-sim-gate-bar bg-cyan sim-w-85" />
                  </div>
                </div>
              )}

              {feature.interactiveType === 'sustainability-preview' && (
                <div className="landing-bento-interactive flex-align justify-between landing-sus-preview">
                  <div className="flex-align event-card-actions-flex">
                    <div className="landing-sus-icon-wrap">
                      <MapPin size={16} className="text-emerald" />
                    </div>
                    <div>
                      <strong className="text-emerald landing-sus-title">Deploying 12 Volunteers</strong>
                      <span className="text-secondary landing-sus-subtitle">Zone B Recycling Stations</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-emerald" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


FeatureGrid.propTypes = {
  sectionRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

export default FeatureGrid;
