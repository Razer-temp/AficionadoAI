import CrowdDensityMap from './CrowdDensityMap';
import FanQueryFeed from './FanQueryFeed';
import BriefingPanel from './BriefingPanel';
import SimulateIncidentButton from './SimulateIncidentButton';
import { useCrowdData } from '../../hooks/useCrowdData';
import {
  Activity,
  Cloud,
  MessageSquare,
  ShieldAlert,
  Radio,
  Wifi,
  Cpu,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import '../../styles/ops.css';

/**
 * Main operations dashboard.
 * Displays crowd density, fan query feed, AI briefings, live weather, and incident simulation.
 * @param {{ fanQueries: Array }} props
 * @returns {JSX.Element}
 */
function OpsDashboard({ fanQueries }) {
  const {
    crowdSnapshot,
    weatherSnapshot,
    isIncident,
    counterDroneAlert,
    setCounterDroneAlert,
    handleSimulate,
    handleClear,
  } = useCrowdData();

  return (
    <div className="ops-dashboard">
      {/* Dashboard Header */}
      <div className="ops-header glass-card">
        <div className="ops-header-info">
          <div className="flex-align" style={{ gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span className="telemetry-pill flex-align text-cyan">
              <Radio size={13} className="pulse-icon" /> LENOVO AI COMMAND CENTER
            </span>
            <span className="telemetry-pill flex-align text-emerald">
              <Wifi size={13} /> VERIZON 5G ULTRA WIDEBAND
            </span>
            <button
              type="button"
              className={`telemetry-pill flex-align ${counterDroneAlert ? 'text-orange pulse-icon' : 'text-emerald'}`}
              onClick={() => setCounterDroneAlert(!counterDroneAlert)}
              style={{
                cursor: 'pointer',
                border: counterDroneAlert ? '1px solid #F97316' : undefined,
                background: 'transparent',
              }}
              title="Click to toggle Sentrycs Counter-Drone test alert"
            >
              <ShieldCheck size={13} /> SENTRYCS RF CYBER-SHIELD:{' '}
              {counterDroneAlert ? 'RF ANOMALY DETECTED' : 'SECURE'}
            </button>
          </div>
          <h2 className="ops-header-title">
            <span className="gradient-text">Operations</span> Command Center
          </h2>
          <p className="ops-header-subtitle flex-align" style={{ gap: '0.5rem' }}>
            <Activity size={14} className="text-cyan" />
            Real-time stadium intelligence — {crowdSnapshot.label} •
            <Cloud size={14} className="text-emerald" style={{ marginLeft: '4px' }} />
            {weatherSnapshot.condition} ({weatherSnapshot.tempF}°F/{weatherSnapshot.tempC}°C) •
            <Zap size={14} className="text-gold" style={{ marginLeft: '4px' }} />
            Trionda 500Hz Ball Telemetry Online
          </p>
        </div>
        <SimulateIncidentButton
          isActive={isIncident}
          onSimulate={handleSimulate}
          onClear={handleClear}
        />
      </div>

      {/* Dashboard Grid */}
      <div className="ops-grid">
        {/* Left Column: Crowd Density + Query Feed */}
        <div className="ops-grid-left">
          <CrowdDensityMap zones={crowdSnapshot.zones} />
          <FanQueryFeed queries={fanQueries} />
        </div>

        {/* Right Column: AI Briefing */}
        <div className="ops-grid-right">
          <BriefingPanel
            crowdSnapshot={crowdSnapshot}
            fanQueries={fanQueries}
            weatherSnapshot={weatherSnapshot}
          />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="ops-status-bar glass-card" role="contentinfo">
        <div className="status-item flex-align">
          <span className="status-dot status-dot--active" aria-hidden="true"></span>
          <span className="flex-align" style={{ gap: '0.4rem' }}>
            <Cpu size={14} className="text-emerald" /> AI Hub Online
          </span>
        </div>
        <div className="status-item flex-align" style={{ gap: '0.4rem' }}>
          <Activity size={14} className="text-cyan" />
          <span>Lidar Flow: {crowdSnapshot.label}</span>
        </div>
        <div className="status-item flex-align" style={{ gap: '0.4rem' }}>
          <Cloud size={14} className="text-emerald" />
          <span>
            Weather: {weatherSnapshot.condition} ({weatherSnapshot.tempF}°F)
          </span>
        </div>
        <div className="status-item flex-align" style={{ gap: '0.4rem' }}>
          <MessageSquare size={14} className="text-gold" />
          <span>Concierge Queries: {fanQueries.length}</span>
        </div>
        <div className="status-item status-simulated flex-align" style={{ gap: '0.4rem' }}>
          <ShieldAlert size={14} className="text-orange" />
          <span>LENOVO AI DIGITAL TWIN (SIMULATED)</span>
        </div>
      </footer>
    </div>
  );
}

export default OpsDashboard;
