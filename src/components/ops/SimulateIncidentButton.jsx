import { ShieldAlert, CheckCircle2, Activity } from 'lucide-react';

/**
 * Simulate Incident button for demo purposes.
 * One-click activation that spikes crowd data at Gate C to show
 * the briefing system react to changing conditions in real-time.
 * @param {{ isActive: boolean, onSimulate: Function, onClear: Function }} props
 * @returns {JSX.Element}
 */
function SimulateIncidentButton({ isActive, onSimulate, onClear }) {
  return (
    <div className="simulate-incident" role="group" aria-label="Incident simulation controls">
      <div className="simulation-buttons flex-align" style={{ gap: '0.6rem' }}>
        {isActive ? (
          <button
            className="incident-btn incident-btn--clear flex-align"
            onClick={onClear}
            aria-label="Clear simulated incident"
            id="clear-incident-btn"
          >
            <CheckCircle2 size={16} />
            <span>Normal Operations</span>
          </button>
        ) : (
          <button
            className="incident-btn incident-btn--simulate flex-align"
            onClick={onSimulate}
            aria-label="Simulate a crowd incident at Gate C"
            id="simulate-incident-btn"
          >
            <ShieldAlert size={16} />
            <span>Trigger Gate C Lidar Surge</span>
          </button>
        )}
      </div>
      <p className="incident-description flex-align" style={{ gap: '0.4rem' }}>
        <Activity size={14} className={isActive ? 'text-orange pulse-icon' : 'text-cyan'} />
        {isActive
          ? 'Digital Twin Active: Gate C transit corridor surge detected. Trigger Gemini briefing for tactical orders.'
          : '3D Digital Twin ready: Simulate localized crowd surge at Gate C to test AI tactical dispatch.'}
      </p>
    </div>
  );
}

export default SimulateIncidentButton;
