/**
 * OpsSimulator — Operations Command Center simulator for the landing page.
 * Shows live query feed, gate crowd density, and AI briefing preview.
 * @module OpsSimulator
 */

import {
  Radio,
  Activity,
  TrendingUp,
  Cpu,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * Ops command center simulator panel.
 * @param {{ opsFeed: Array, surgeActive: boolean, setSurgeActive: Function, onNavigate: Function }} props
 * @returns {JSX.Element}
 */
function OpsSimulator({ opsFeed, surgeActive, setSurgeActive, onNavigate }) {
  return (
    <div className="landing-sim-ops-layout">
      <div className="landing-sim-ops-header">
        <div>
          <h3 className="landing-sim-ops-title">
            MetLife Stadium · Live Operations Command Center
          </h3>
          <p className="landing-sim-ops-sub">
            Real-time crowd intelligence synthesized from 100% anonymized fan interactions
          </p>
        </div>
        <div className="landing-sim-ops-controls">
          <button
            className={`landing-sim-surge-toggle ${surgeActive ? 'landing-sim-surge-toggle--active' : ''}`}
            onClick={() => setSurgeActive(!surgeActive)}
          >
            <AlertCircle size={16} />
            <span>
              {surgeActive ? '🚨 Surge Simulated (Gate C)' : '⚡ Simulate Crowd Surge'}
            </span>
          </button>
          <button className="landing-sim-ops-full-btn" onClick={() => onNavigate('/ops')}>
            <span>Launch Live Ops Console (/ops)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="landing-sim-ops-grid">
        {/* Telemetry Stream */}
        <div className="landing-sim-ops-box">
          <div className="landing-sim-ops-box-header">
            <span className="flex-align gap-2">
              <Radio size={15} className="text-cyan pulse-icon" />
              <strong>Anonymized Fan Query Stream</strong>
            </span>
            <span className="telemetry-pill">Live Ingestion</span>
          </div>
          <div className="landing-sim-ops-feed">
            {opsFeed.map((item) => (
              <div key={item.id} className="landing-sim-ops-feed-item">
                <div className="landing-sim-ops-feed-top">
                  <span className="landing-sim-ops-feed-lang">{item.lang}</span>
                  <strong className="landing-sim-ops-feed-query">
                    &quot;{item.query}&quot;
                  </strong>
                  <span className="landing-sim-ops-feed-time">{item.time}</span>
                </div>
                <div className="landing-sim-ops-feed-impact">
                  <TrendingUp size={13} className="text-emerald" />
                  <span>{item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Heatmap / Gate Status */}
        <div className="landing-sim-ops-box">
          <div className="landing-sim-ops-box-header">
            <span className="flex-align gap-2">
              <Activity size={15} className="text-emerald" />
              <strong>Venue Gate Crowd Density</strong>
            </span>
            <span className="telemetry-pill">
              {surgeActive ? '1 SURGE DETECTED' : 'OPTIMAL FLOW'}
            </span>
          </div>

          <div className="landing-sim-gates-list">
            <div className="landing-sim-gate-item">
              <div className="landing-sim-gate-name">Gate A (Main North)</div>
              <div className="landing-sim-gate-bar-wrap">
                <div className="landing-sim-gate-bar bg-emerald" style={{ width: '38%' }} />
              </div>
              <span className="landing-sim-gate-stat text-emerald">3m wait</span>
            </div>
            <div className="landing-sim-gate-item">
              <div className="landing-sim-gate-name">Gate B (VIP & Accessible)</div>
              <div className="landing-sim-gate-bar-wrap">
                <div className="landing-sim-gate-bar bg-cyan" style={{ width: '25%' }} />
              </div>
              <span className="landing-sim-gate-stat text-cyan">1m wait</span>
            </div>
            <div className="landing-sim-gate-item">
              <div className="landing-sim-gate-name">Gate C (Express South)</div>
              <div className="landing-sim-gate-bar-wrap">
                <div
                  className={`landing-sim-gate-bar ${surgeActive ? 'bg-red' : 'bg-gold'}`}
                  style={{ width: surgeActive ? '92%' : '65%' }}
                />
              </div>
              <span
                className={`landing-sim-gate-stat ${surgeActive ? 'text-red font-bold' : 'text-gold'}`}
              >
                {surgeActive ? '🚨 18m wait (High)' : '7m wait'}
              </span>
            </div>
            <div className="landing-sim-gate-item">
              <div className="landing-sim-gate-name">Gate D (Transit Hub)</div>
              <div className="landing-sim-gate-bar-wrap">
                <div className="landing-sim-gate-bar bg-emerald" style={{ width: '42%' }} />
              </div>
              <span className="landing-sim-gate-stat text-emerald">4m wait</span>
            </div>
          </div>

          {/* AI Actionable Recommendations */}
          <div className="landing-sim-ops-briefing">
            <div className="landing-sim-ops-briefing-header">
              <Cpu size={15} className="text-cyan" />
              <strong>AI Actionable Briefing & Recommendation</strong>
            </div>
            <p className="landing-sim-ops-briefing-text">
              {surgeActive ? (
                <>
                  <strong className="text-orange">🚨 Action Required:</strong> Gate C crowd
                  volume reached 92% threshold due to NJ Transit arrival.{' '}
                  <em>AI Action:</em> Automated AI Concierge has redirected 34% of incoming
                  fan queries to Gate D. Recommend dispatching 3 crowd stewards to Concourse
                  C corridor.
                </>
              ) : (
                <>
                  <strong className="text-emerald">🟢 All Systems Stable:</strong> Fan
                  queries indicate steady dispersion across Gates A and D. Halal vendor
                  demand at Section 204 is elevated (+8%) — inventory verified sufficient.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpsSimulator;
