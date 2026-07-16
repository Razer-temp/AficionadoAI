/**
 * OrganizerDashboard — Event management interface for organizers.
 * Create events, generate links/claim codes, monitor sessions.
 * @module OrganizerDashboard
 */

import { useState } from 'react';
import {
  Plus,
  Ticket,
  Users,
  CalendarDays,
  Activity,
  Loader2,
  Settings,
  Radio,
} from 'lucide-react';
import { useOrganizerEvents } from '../../hooks/useOrganizerEvents';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';
import '../../styles/organizer.css';

/**
 * Main organizer dashboard component.
 * @returns {JSX.Element}
 */
function OrganizerDashboard() {
  const {
    events,
    loading,
    expandedEvent,
    eventCodes,
    sessionCounts,
    loadEvents,
    handleToggleActive,
    handleDelete,
    handleGenerateCodes,
    handleExpandEvent,
  } = useOrganizerEvents();

  const [showCreateModal, setShowCreateModal] = useState(false);

  function getEventStatus(event) {
    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);

    if (!event.is_active) return { label: 'Inactive', class: 'inactive' };
    if (now < startsAt) return { label: 'Upcoming', class: 'upcoming' };
    if (now > endsAt) return { label: 'Expired', class: 'expired' };
    return { label: 'Live', class: 'live' };
  }

  return (
    <div className="org-layout">
      <div className="org-dashboard">
        {/* Dashboard Header */}
        <header className="org-header org-header-card">
          <div className="org-header-info">
            <div className="org-header-badge">
              <Settings size={14} className="pulse-icon" />
              <span>Event Management Protocol</span>
            </div>
            <h1 className="org-header-title">
              <span className="gradient-text">Organizer</span> Command Center
            </h1>
            <p className="org-header-subtitle">
              <Activity size={15} />
              Create, configure, and manage access credentials for live stadium sessions
            </p>
          </div>
          <button className="org-create-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        </header>

        {/* Stats Overview */}
        <div className="org-stats-row">
          <div className="org-stat-card">
            <div className="org-stat-icon" style={{ color: 'var(--accent-blue)' }}>
              <CalendarDays size={20} />
            </div>
            <div className="org-stat-data">
              <span className="org-stat-value">{events.length}</span>
              <span className="org-stat-label">Total Events</span>
            </div>
          </div>
          <div className="org-stat-card">
            <div className="org-stat-icon" style={{ color: 'var(--accent-green)' }}>
              <Radio size={20} />
            </div>
            <div className="org-stat-data">
              <span className="org-stat-value">
                {events.filter((e) => getEventStatus(e).class === 'live').length}
              </span>
              <span className="org-stat-label">Live Now</span>
            </div>
          </div>
          <div className="org-stat-card">
            <div className="org-stat-icon" style={{ color: 'var(--accent-purple)' }}>
              <Users size={20} />
            </div>
            <div className="org-stat-data">
              <span className="org-stat-value">
                {Object.values(sessionCounts).reduce((a, b) => a + b, 0)}
              </span>
              <span className="org-stat-label">Active Sessions</span>
            </div>
          </div>
          <div className="org-stat-card">
            <div className="org-stat-icon" style={{ color: 'var(--accent-amber)' }}>
              <Ticket size={20} />
            </div>
            <div className="org-stat-data">
              <span className="org-stat-value">
                {
                  Object.values(eventCodes)
                    .flat()
                    .filter((c) => c?.is_claimed).length
                }
              </span>
              <span className="org-stat-label">Codes Claimed</span>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="org-events-section">
          <h2 className="org-section-title">
            <CalendarDays size={20} className="text-cyan" />
            <span>
              Stadium Protocol <span className="gradient-text">Events Catalog</span>
            </span>
          </h2>

          {loading ? (
            <div className="org-loading" role="status">
              <Loader2 size={32} className="gate-spinner" aria-hidden="true" />
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="org-empty glass-card">
              <CalendarDays size={48} className="org-empty-icon" />
              <h3>No Events Yet</h3>
              <p>Create your first event to generate access links for fans and ops staff.</p>
              <button className="org-create-btn" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
                <span>Create Event</span>
              </button>
            </div>
          ) : (
            <div className="org-events-list">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isExpanded={expandedEvent === event.id}
                  onExpand={handleExpandEvent}
                  codes={eventCodes[event.id] || []}
                  sessions={sessionCounts[event.id] || 0}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onGenerateCodes={handleGenerateCodes}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadEvents();
          }}
        />
      )}
    </div>
  );
}

export default OrganizerDashboard;
