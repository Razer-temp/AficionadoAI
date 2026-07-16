import PropTypes from 'prop-types';
/**
 * EventCard — Represents a single event in the organizer dashboard.
 * @module EventCard
 */

import { useState } from 'react';
import {
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
  KeyRound,
  ExternalLink,
  Plus,
  Hash,
} from 'lucide-react';

function EventCard({
  event,
  isExpanded,
  onExpand,
  codes,
  sessions,
  onToggleActive,
  onDelete,
  onGenerateCodes,
}) {
  const [copiedField, setCopiedField] = useState(null);

  function copyToClipboard(text, fieldId) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  function getEventStatus(evt) {
    const now = new Date();
    const startsAt = new Date(evt.starts_at);
    const endsAt = new Date(evt.ends_at);

    if (!evt.is_active) return { label: 'Inactive', class: 'inactive' };
    if (now < startsAt) return { label: 'Upcoming', class: 'upcoming' };
    if (now > endsAt) return { label: 'Expired', class: 'expired' };
    return { label: 'Live', class: 'live' };
  }

  function getFanLink(evt) {
    const base = window.location.origin;
    return `${base}/event/${evt.slug}`;
  }

  function getOpsLink(evt) {
    const base = window.location.origin;
    return `${base}/event/${evt.slug}/ops?key=${evt.ops_access_key}`;
  }

  const status = getEventStatus(event);

  return (
    <div className={`org-event-card glass-card ${isExpanded ? 'org-event-card--expanded' : ''}`}>
      <div
        className="org-event-header"
        onClick={() => onExpand(event.id)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? `Collapse ${event.name}` : `Expand ${event.name}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onExpand(event.id);
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

      {isExpanded && (
        <div className="org-event-detail">
          {/* Links Section */}
          <div className="org-detail-section">
            <h4 className="org-detail-title">
              <Link2 size={16} className="text-cyan" />
              <span>Access Links Portal</span>
            </h4>
            <div className="org-links-grid">
              <div className="org-link-card org-link-card--fan">
                <div className="org-link-label">
                  <span className="flex-align event-card-actions-flex">
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
                    onClick={() => copyToClipboard(getFanLink(event), `fan-${event.id}`)}
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

              <div className="org-link-card org-link-card--ops">
                <div className="org-link-label">
                  <span className="flex-align event-card-actions-flex">
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
                    onClick={() => copyToClipboard(getOpsLink(event), `ops-${event.id}`)}
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

          {/* Claim Codes Section */}
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
                      <strong>{codes.filter((c) => c.is_claimed).length}</strong> / {codes.length}{' '}
                      claimed
                    </span>
                  )}
                </div>
                <div className="org-code-actions">
                  <button className="org-gen-btn" onClick={() => onGenerateCodes(event.id, 5)}>
                    <Plus size={14} />
                    <span>Generate 5 Codes</span>
                  </button>
                  <button className="org-gen-btn" onClick={() => onGenerateCodes(event.id, 20)}>
                    <Plus size={14} />
                    <span>Generate 20 Codes</span>
                  </button>
                </div>
              </div>

              {codes.length === 0 ? (
                <div className="org-codes-empty">
                  <Ticket size={28} className="text-muted" />
                  <p>
                    No access codes generated yet. Generate credentials to distribute to verified
                    stadium attendees.
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
                          onClick={() => copyToClipboard(code.code, `code-${code.id}`)}
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
                onClick={() => onToggleActive(event.id, event.is_active)}
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
                onClick={() => onDelete(event.id)}
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
}


EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    venue: PropTypes.string,
    event_date: PropTypes.string.isRequired,
    starts_at: PropTypes.string.isRequired,
    ends_at: PropTypes.string.isRequired,
    is_active: PropTypes.bool.isRequired,
    require_claim_code: PropTypes.bool.isRequired,
    ops_access_key: PropTypes.string,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  codes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    is_claimed: PropTypes.bool.isRequired,
  })).isRequired,
  sessions: PropTypes.number.isRequired,
  onToggleActive: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onGenerateCodes: PropTypes.func.isRequired,
};

export default EventCard;
