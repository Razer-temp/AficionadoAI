import { HeartHandshake, Leaf, Users } from 'lucide-react';
import '../../styles/ops.css';

/**
 * VolunteerPanel — Displays volunteer deployment and sustainability metrics.
 * @returns {JSX.Element}
 */
export default function VolunteerPanel() {
  return (
    <div className="ops-card glass-card">
      <div className="ops-card-header">
        <div className="flex-align text-cyan">
          <HeartHandshake size={18} />
          <h3 className="ops-card-title">Volunteer & Sustainability</h3>
        </div>
      </div>
      <div className="volunteer-panel-list">
        <div className="volunteer-stat-row volunteer-stat-row--green">
          <div className="volunteer-stat-title text-emerald">
            <Leaf size={16} />
            <span>Zero-Waste Initiative</span>
          </div>
          <span className="volunteer-stat-text">+12% Recycling Rate Today</span>
        </div>
        <div className="volunteer-stat-row volunteer-stat-row--blue">
          <div className="volunteer-stat-title text-cyan">
            <Users size={16} />
            <span>Volunteer Deployment</span>
          </div>
          <span className="volunteer-stat-text">24 Active near Gate C</span>
        </div>
      </div>
    </div>
  );
}
