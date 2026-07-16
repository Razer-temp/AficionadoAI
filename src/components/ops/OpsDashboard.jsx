import PropTypes from 'prop-types';
import CrowdDensityMap from './CrowdDensityMap';
import FanQueryFeed from './FanQueryFeed';
import BriefingPanel from './BriefingPanel';
import SimulateIncidentButton from './SimulateIncidentButton';
import VolunteerPanel from './VolunteerPanel';
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
          <div className="flex-align ops-header-telemetry-row">
            <span className="telemetry-pill flex-align text-cyan">
              <Radio size={13} className="pulse-icon" /> LENOVO AI COMMAND CENTER
            </span>
            <span className="telemetry-pill flex-align text-emerald">
              <Wifi size={13} /> VERIZON 5G ULTRA WIDEBAND
            </span>
            <button
              type="button"
              className={`telemetry-pill flex-align ops-drone-btn ${counterDroneAlert ? 'text-orange pulse-icon alert-active' : 'text-emerald'}`}
              onClick={() => setCounterDroneAlert(!counterDroneAlert)}
              title="Click to toggle Sentrycs Counter-Drone test alert"
            >
              <ShieldCheck size={13} /> SENTRYCS RF CYBER-SHIELD:{' '}
              {counterDroneAlert ? 'RF ANOMALY DETECTED' : 'SECURE'}
            </button>
          </div>
          <h2 className="ops-header-title">
            <span className="gradient-text">Operations</span> Command Center
          </h2>
          <p className="ops-header-subtitle flex-align ops-header-subtitle-row">
            <Activity size={14} className="text-cyan" />
            Real-time stadium intelligence — {crowdSnapshot.label} •
            <Cloud size={14} className="text-emerald ops-header-icon-spaced" />
            {weatherSnapshot.condition} ({weatherSnapshot.tempF}°F/{weatherSnapshot.tempC}°C) •
            <Zap size={14} className="text-gold ops-header-icon-spaced" />
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

        {/* Right Column: AI Briefing & Volunteers */}
        <div className="ops-grid-right">
          <BriefingPanel
            crowdSnapshot={crowdSnapshot}
            fanQueries={fanQueries}
            weatherSnapshot={weatherSnapshot}
          />
          <VolunteerPanel />
        </div>
      </div>

      {/* Status Bar */}
      <footer className="ops-status-bar glass-card" role="contentinfo">
        <div className="status-item flex-align">
          <span className="status-dot status-dot--active" aria-hidden="true"></span>
          <span className="flex-align ops-status-item-flex">
            <Cpu size={14} className="text-emerald" /> AI Hub Online
          </span>
        </div>
        <div className="status-item flex-align ops-status-item-flex">
          <Activity size={14} className="text-cyan" />
          <span>Lidar Flow: {crowdSnapshot.label}</span>
        </div>
        <div className="status-item flex-align ops-status-item-flex">
          <Cloud size={14} className="text-emerald" />
          <span>
            Weather: {weatherSnapshot.condition} ({weatherSnapshot.tempF}°F)
          </span>
        </div>
        <div className="status-item flex-align ops-status-item-flex">
          <MessageSquare size={14} className="text-gold" />
          <span>Concierge Queries: {fanQueries.length}</span>
        </div>
        <div className="status-item status-simulated flex-align ops-status-item-flex">
          <ShieldAlert size={14} className="text-orange" />
          <span>LENOVO AI DIGITAL TWIN (SIMULATED)</span>
        </div>
      </footer>
    </div>
  );
}


OpsDashboard.propTypes = {
  fanQueries: PropTypes.array.isRequired,
};

export default OpsDashboard;
