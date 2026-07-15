/**
 * OrganizerDashboard — Event management interface for organizers.
 * Create events, generate links/claim codes, monitor sessions.
 * @module OrganizerDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import {
  createEvent,
  getAllEvents,
  generateClaimCodes,
  getClaimCodes,
  getActiveSessionCount,
  toggleEventActive,
  deleteEvent,
  generateSlug,
} from '../../services/eventService';
import {
  Plus,
  Link2,
  Copy,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Ticket,
  Users,
  CalendarDays,
  MapPin,
  ChevronDown,
  ChevronUp,
  Shield,
  Activity,
  KeyRound,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Hash,
  Settings,
  Radio,
} from 'lucide-react';
import '../../styles/organizer.css';

/**
 * Main organizer dashboard component.
 * @returns {JSX.Element}
 */
function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [eventCodes, setEventCodes] = useState({});
  const [sessionCounts, setSessionCounts] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  const loadSessionCount = useCallback(async (eventId) => {
    const result = await getActiveSessionCount(eventId);
    if (result.success) {
      setSessionCounts((prev) => ({ ...prev, [eventId]: result.count }));
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const result = await getAllEvents();
    if (result.success) {
      setEvents(result.data);
      // Load session counts for all events
      for (const event of result.data) {
        loadSessionCount(event.id);
      }
    }
    setLoading(false);
  }, [loadSessionCount]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function loadCodes(eventId) {
    const result = await getClaimCodes(eventId);
    if (result.success) {
      setEventCodes((prev) => ({ ...prev, [eventId]: result.data }));
    }
  }

  async function handleToggleActive(eventId, currentState) {
    const result = await toggleEventActive(eventId, !currentState);
    if (result.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, is_active: !currentState } : e)),
      );
    }
  }

  async function handleDelete(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.'))
      return;
    const result = await deleteEvent(eventId);
    if (result.success) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      if (expandedEvent === eventId) setExpandedEvent(null);
    }
  }

  async function handleGenerateCodes(eventId, count) {
    const result = await generateClaimCodes(eventId, count);
    if (result.success) {
      await loadCodes(eventId);
    }
  }

  function handleExpandEvent(eventId) {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
      if (!eventCodes[eventId]) {
        loadCodes(eventId);
      }
    }
  }

  function copyToClipboard(text, fieldId) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  function getEventStatus(event) {
    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);

    if (!event.is_active) return { label: 'Inactive', class: 'inactive' };
    if (now < startsAt) return { label: 'Upcoming', class: 'upcoming' };
    if (now > endsAt) return { label: 'Expired', class: 'expired' };
    return { label: 'Live', class: 'live' };
  }

  function getFanLink(event) {
    const base = window.location.origin;
    return `${base}/event/${event.slug}`;
  }

  function getOpsLink(event) {
    const base = window.location.origin;
    return `${base}/event/${event.slug}/ops?key=${event.ops_access_key}`;
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
            <div className="org-loading">
              <Loader2 size={32} className="gate-spinner" />
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
              {events.map((event) => {
                const status = getEventStatus(event);
                const isExpanded = expandedEvent === event.id;
                const codes = eventCodes[event.id] || [];
                const sessions = sessionCounts[event.id] || 0;

                return (
                  <div
                    key={event.id}
                    className={`org-event-card glass-card ${isExpanded ? 'org-event-card--expanded' : ''}`}
                  >
                    {/* Event Card Header */}
                    <div
                      className="org-event-header"
                      onClick={() => handleExpandEvent(event.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleExpandEvent(event.id);
                        }
                      }}
                    >
                      <div className="org-event-main">
                        <div className="org-event-title-row">
                          <h3 className="org-event-name">{event.name}</h3>
                          <span className={`org-status-badge org-status--${status.class}`}>
                            {status.class === 'live' && <span className="org-live-dot" />}
                            {status.label}
                          </span>
                        </div>
                        <div className="org-event-meta-row">
                          <span className="org-event-meta-item">
                            <MapPin size={13} />
                            {event.venue}
                          </span>
                          <span className="org-event-meta-item">
                            <CalendarDays size={13} />
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="org-event-meta-item">
                            <Users size={13} />
                            {sessions} session{sessions !== 1 ? 's' : ''}
                          </span>
                          {event.require_claim_code && (
                            <span className="org-event-meta-item org-meta-code">
                              <KeyRound size={13} />
                              Claim codes required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="org-event-actions-mini">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="org-event-detail">
                        {/* Links Section */}
                        <div className="org-detail-section">
                          <h4 className="org-detail-title">
                            <Link2 size={16} className="text-cyan" />
                            <span>Access Links Portal</span>
                          </h4>
                          <div className="org-links-grid">
                            {/* Fan Link */}
                            <div className="org-link-card org-link-card--fan">
                              <div className="org-link-label">
                                <span className="flex-align" style={{ gap: '6px' }}>
                                  <Users size={14} className="text-emerald" />
                                  Fan Access Portal
                                </span>
                                <span className="org-link-tag">Public Concierge</span>
                              </div>
                              <div className="org-link-row">
                                <input
                                  type="text"
                                  readOnly
                                  value={getFanLink(event)}
                                  className="org-link-input"
                                  onClick={(e) => e.target.select()}
                                />
                                <button
                                  className={`org-copy-btn ${copiedField === `fan-${event.id}` ? 'org-copy-btn--copied' : ''}`}
                                  onClick={() =>
                                    copyToClipboard(getFanLink(event), `fan-${event.id}`)
                                  }
                                  title="Copy fan link"
                                >
                                  {copiedField === `fan-${event.id}` ? (
                                    <>
                                      <Check size={14} />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                <a
                                  href={getFanLink(event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="org-open-btn"
                                  title="Open fan link"
                                >
                                  <ExternalLink size={14} />
                                  <span>Open Portal</span>
                                </a>
                              </div>
                            </div>

                            {/* Ops Link */}
                            <div className="org-link-card org-link-card--ops">
                              <div className="org-link-label">
                                <span className="flex-align" style={{ gap: '6px' }}>
                                  <Shield size={14} className="text-cyan" />
                                  Ops Staff Portal
                                </span>
                                <span className="org-link-tag org-link-tag--secure">
                                  Encrypted Key Access
                                </span>
                              </div>
                              <div className="org-link-row">
                                <input
                                  type="text"
                                  readOnly
                                  value={getOpsLink(event)}
                                  className="org-link-input"
                                  onClick={(e) => e.target.select()}
                                />
                                <button
                                  className={`org-copy-btn ${copiedField === `ops-${event.id}` ? 'org-copy-btn--copied' : ''}`}
                                  onClick={() =>
                                    copyToClipboard(getOpsLink(event), `ops-${event.id}`)
                                  }
                                  title="Copy ops link"
                                >
                                  {copiedField === `ops-${event.id}` ? (
                                    <>
                                      <Check size={14} />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                <a
                                  href={getOpsLink(event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="org-open-btn"
                                  title="Open ops link"
                                >
                                  <ExternalLink size={14} />
                                  <span>Open Portal</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Claim Codes Section (if enabled) */}
                        {event.require_claim_code && (
                          <div className="org-detail-section">
                            <div className="org-detail-header">
                              <div className="org-detail-title-group">
                                <h4 className="org-detail-title">
                                  <Ticket size={16} className="text-gold" />
                                  <span>Claim Codes Vault</span>
                                </h4>
                                {codes.length > 0 && (
                                  <span className="org-codes-pill">
                                    <strong>{codes.filter((c) => c.is_claimed).length}</strong> /{' '}
                                    {codes.length} claimed
                                  </span>
                                )}
                              </div>
                              <div className="org-code-actions">
                                <button
                                  className="org-gen-btn"
                                  onClick={() => handleGenerateCodes(event.id, 5)}
                                >
                                  <Plus size={14} />
                                  <span>Generate 5 Codes</span>
                                </button>
                                <button
                                  className="org-gen-btn"
                                  onClick={() => handleGenerateCodes(event.id, 20)}
                                >
                                  <Plus size={14} />
                                  <span>Generate 20 Codes</span>
                                </button>
                              </div>
                            </div>

                            {codes.length === 0 ? (
                              <div className="org-codes-empty">
                                <Ticket size={28} className="text-muted" />
                                <p>
                                  No access codes generated yet. Generate credentials to distribute
                                  to verified stadium attendees.
                                </p>
                              </div>
                            ) : (
                              <div className="org-codes-grid">
                                {codes.map((code) => (
                                  <div
                                    key={code.id}
                                    className={`org-code-chip ${code.is_claimed ? 'org-code-chip--claimed' : ''}`}
                                  >
                                    <div className="org-code-main">
                                      <Hash size={13} className="org-code-hash" />
                                      <span className="org-code-text">{code.code}</span>
                                    </div>
                                    {code.is_claimed ? (
                                      <span className="org-code-status-pill">
                                        <Check size={12} />
                                        <span>Claimed</span>
                                      </span>
                                    ) : (
                                      <button
                                        className={`org-code-copy ${copiedField === `code-${code.id}` ? 'org-code-copy--copied' : ''}`}
                                        onClick={() =>
                                          copyToClipboard(code.code, `code-${code.id}`)
                                        }
                                        title="Copy code"
                                      >
                                        {copiedField === `code-${code.id}` ? (
                                          <Check size={14} className="text-emerald" />
                                        ) : (
                                          <Copy size={14} />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Event Controls */}
                        <div className="org-controls-section">
                          <div className="org-controls-info">
                            <span className="org-controls-label">Event Protocol Controls</span>
                            <span className="org-controls-desc">
                              {event.is_active
                                ? 'Deactivating pauses new sessions and restricts fan gate access.'
                                : 'Activating enables live fan gate entry and real-time AI concierge sessions.'}
                            </span>
                          </div>
                          <div className="org-controls-actions">
                            <button
                              className={`org-control-btn ${event.is_active ? 'org-control-btn--deactivate' : 'org-control-btn--activate'}`}
                              onClick={() => handleToggleActive(event.id, event.is_active)}
                            >
                              {event.is_active ? (
                                <>
                                  <ToggleRight size={18} />
                                  <span>Deactivate Event</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={18} />
                                  <span>Activate Event</span>
                                </>
                              )}
                            </button>
                            <button
                              className="org-control-btn org-control-btn--delete"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 size={16} />
                              <span>Delete Event</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

// ============================================================
// CREATE EVENT MODAL
// ============================================================

function CreateEventModal({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    venue: 'MetLife Stadium',
    description: '',
    eventDate: '',
    startsAt: '',
    endsAt: '',
    requireClaimCode: false,
    maxCapacity: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill time windows when event date changes
    if (field === 'eventDate' && value) {
      const eventDate = new Date(value);
      const startsAt = new Date(eventDate.getTime() - 4 * 60 * 60 * 1000); // 4 hours before
      const endsAt = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000); // 5 hours after
      setFormData((prev) => ({
        ...prev,
        eventDate: value,
        startsAt: formatDateTimeLocal(startsAt),
        endsAt: formatDateTimeLocal(endsAt),
      }));
    }
  }

  function formatDateTimeLocal(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.eventDate || !formData.startsAt || !formData.endsAt) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    const slug = generateSlug(formData.name, formData.eventDate);

    const result = await createEvent({
      name: formData.name,
      venue: formData.venue,
      description: formData.description || null,
      eventDate: new Date(formData.eventDate).toISOString(),
      startsAt: new Date(formData.startsAt).toISOString(),
      endsAt: new Date(formData.endsAt).toISOString(),
      slug,
      requireClaimCode: formData.requireClaimCode,
      maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity, 10) : null,
    });

    if (result.success) {
      onCreated();
    } else {
      setError(result.error || 'Failed to create event');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="org-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="org-modal glass-card" role="dialog" aria-modal="true">
        <div className="org-modal-header">
          <h2 className="org-modal-title">
            <Plus size={20} />
            Create New Event
          </h2>
          <button className="org-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form className="org-modal-form" onSubmit={handleSubmit}>
          {/* Event Name */}
          <div className="org-form-group">
            <label className="org-form-label" htmlFor="event-name">
              Event Name <span className="org-required">*</span>
            </label>
            <input
              id="event-name"
              type="text"
              className="org-form-input"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Brazil vs Germany — Semifinal"
              maxLength={100}
              required
            />
          </div>

          {/* Venue */}
          <div className="org-form-group">
            <label className="org-form-label" htmlFor="event-venue">
              Venue
            </label>
            <input
              id="event-venue"
              type="text"
              className="org-form-input"
              value={formData.venue}
              onChange={(e) => updateField('venue', e.target.value)}
              placeholder="MetLife Stadium"
            />
          </div>

          {/* Description */}
          <div className="org-form-group">
            <label className="org-form-label" htmlFor="event-desc">
              Description
            </label>
            <textarea
              id="event-desc"
              className="org-form-input org-form-textarea"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Optional event description..."
              rows={3}
            />
          </div>

          {/* Event Date */}
          <div className="org-form-group">
            <label className="org-form-label" htmlFor="event-date">
              Event Date & Time <span className="org-required">*</span>
            </label>
            <input
              id="event-date"
              type="datetime-local"
              className="org-form-input"
              value={formData.eventDate}
              onChange={(e) => updateField('eventDate', e.target.value)}
              required
            />
          </div>

          {/* Access Window */}
          <div className="org-form-row">
            <div className="org-form-group">
              <label className="org-form-label" htmlFor="event-starts">
                Access Opens <span className="org-required">*</span>
              </label>
              <input
                id="event-starts"
                type="datetime-local"
                className="org-form-input"
                value={formData.startsAt}
                onChange={(e) => updateField('startsAt', e.target.value)}
                required
              />
            </div>
            <div className="org-form-group">
              <label className="org-form-label" htmlFor="event-ends">
                Access Closes <span className="org-required">*</span>
              </label>
              <input
                id="event-ends"
                type="datetime-local"
                className="org-form-input"
                value={formData.endsAt}
                onChange={(e) => updateField('endsAt', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Max Capacity */}
          <div className="org-form-group">
            <label className="org-form-label" htmlFor="event-capacity">
              Expected Capacity
            </label>
            <input
              id="event-capacity"
              type="number"
              className="org-form-input"
              value={formData.maxCapacity}
              onChange={(e) => updateField('maxCapacity', e.target.value)}
              placeholder="e.g., 82500"
              min={0}
            />
          </div>

          {/* Require Claim Code Toggle */}
          <div className="org-form-toggle">
            <div className="org-toggle-info">
              <KeyRound size={18} />
              <div>
                <span className="org-toggle-label">Require Claim Codes</span>
                <span className="org-toggle-desc">
                  Fans must enter a unique code to access the AI concierge. If disabled, anyone with
                  the link can access the event.
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`org-toggle-switch ${formData.requireClaimCode ? 'org-toggle-switch--on' : ''}`}
              onClick={() => updateField('requireClaimCode', !formData.requireClaimCode)}
              role="switch"
              aria-checked={formData.requireClaimCode}
            >
              <span className="org-toggle-thumb" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="org-form-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="org-modal-actions">
            <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="org-btn org-btn--primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="gate-spinner" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Create Event</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
