import { memo } from 'react';
import { CheckCircle2, MinusCircle, AlertTriangle, ShieldAlert, Radio, Activity } from 'lucide-react';

const ICON_MAP = {
  CheckCircle2: CheckCircle2,
  MinusCircle: MinusCircle,
  AlertTriangle: AlertTriangle,
  ShieldAlert: ShieldAlert,
};

/**
 * Crowd density visualization for ops dashboard.
 * Shows gate/zone cards with density indicators using icon + color + text
 * (not color-only — accessibility requirement).
 * @param {{ zones: Array<{ id: string, name: string, direction: string, density: number, level: { label: string, iconName?: string, color: string } }> }} props
 * @returns {JSX.Element}
 */
const CrowdDensityMap = memo(function CrowdDensityMap({ zones }) {
  if (!zones || zones.length === 0) {
    return (
      <div className="ops-card">
        <div className="ops-card-header">
          <Activity size={20} className="text-cyan" />
          <h3 className="ops-card-title">Lidar Crowd Density Grid</h3>
        </div>
        <p className="ops-card-empty">No telemetry data available.</p>
      </div>
    );
  }

  return (
    <section className="ops-card crowd-density-card glass-card" aria-label="Crowd density map">
      <div className="ops-card-header">
        <div className="flex-align" style={{ gap: '0.6rem' }}>
          <Radio size={20} className="pulse-icon text-cyan" />
          <h3 className="ops-card-title">Lenovo AI Lidar Crowd Grid</h3>
        </div>
        <div className="flex-align" style={{ gap: '0.5rem' }}>
          <span className="ops-card-badge simulated-badge flex-align" style={{ gap: '0.3rem' }}>
            <Activity size={12} /> 3D DIGITAL TWIN
          </span>
        </div>
      </div>
      <div className="crowd-grid" role="list" aria-label="Zone density levels">
        {zones.map((zone) => {
          const IconComponent = ICON_MAP[zone.level.iconName] || Activity;
          return (
            <div
              key={zone.id}
              className="crowd-zone-card"
              role="listitem"
              aria-label={`${zone.name}: ${zone.density}% capacity, ${zone.level.label}`}
              style={{
                '--zone-color': zone.level.color,
                '--zone-glow': `${zone.level.color}33`,
              }}
            >
              <div className="zone-header">
                <IconComponent className="zone-icon" size={18} style={{ color: zone.level.color }} />
                <span className="zone-name">{zone.name}</span>
              </div>
              <div className="zone-density">
                <div className="zone-bar-track">
                  <div
                    className="zone-bar-fill"
                    style={{ width: `${zone.density}%`, backgroundColor: zone.level.color }}
                    role="progressbar"
                    aria-valuenow={zone.density}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${zone.density}% capacity`}
                  />
                </div>
                <div className="zone-stats">
                  <span className="zone-percent">{zone.density}%</span>
                  <span className="zone-level" style={{ color: zone.level.color }}>
                    {zone.level.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default CrowdDensityMap;
