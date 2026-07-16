/**
 * EventGate — Fan access gate for event-scoped links.
 * Validates event existence, time windows, and optional claim codes
 * before granting access to the AI concierge.
 * @module EventGate
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from './EventContext';
import {
  getEventBySlug,
  claimEventCodeBySlug,
  createSession,
  checkEventTimeWindow,
} from '../../services/eventService';
import { TIMINGS } from '../../utils/constants';
import {
  Shield,
  Clock,
  MapPin,
  CalendarDays,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Ticket,
  Users,
  Lock,
  XCircle,
} from 'lucide-react';
import '../../styles/gate.css';

/**
 * Gate component displayed when a fan opens an event link.
 * Handles the full access flow: fetch event → check time → validate code → grant access.
 * @returns {JSX.Element}
 */
function EventGate() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setEventData, loadFromStorage } = useEvent();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeStatus, setTimeStatus] = useState(null);
  const [claimCode, setClaimCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [codeError, setCodeError] = useState(null);
  const [accessGranted, setAccessGranted] = useState(false);

  const codeInputRef = useRef(null);

  // Check if user already has a session from storage
  useEffect(() => {
    const stored = loadFromStorage(slug);
    if (stored?.sessionToken) {
      setAccessGranted(true);
      setTimeout(() => {
        navigate(`/event/${slug}/fan`, { replace: true });
      }, TIMINGS.GATE_REDIRECT_FAST);
      return;
    }

    fetchEvent();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetches the event details based on the URL slug.
   * Handles error states and time window validation.
   */
  async function fetchEvent() {
    setLoading(true);
    setError(null);

    const result = await getEventBySlug(slug);

    if (!result.success || !result.data) {
      setError('Event not found');
      setLoading(false);
      return;
    }

    const eventData = result.data;
    setEvent(eventData);

    // Check if event is active
    if (!eventData.is_active) {
      setError('This event is currently inactive');
      setLoading(false);
      return;
    }

    // Check time window
    const timeCheck = checkEventTimeWindow(eventData);
    setTimeStatus(timeCheck);

    setLoading(false);

    // If no claim code required and time window is open, grant access directly
    if (!eventData.require_claim_code && timeCheck.isOpen) {
      grantDirectAccess(eventData);
    }
  }

  /**
   * Directly grants fan access to the event when no claim code is required.
   * Creates a session and redirects to the Fan UI.
   * @param {object} eventData - The validated event object
   */
  async function grantDirectAccess(eventData) {
    const token = crypto.randomUUID();
    await createSession(eventData.id, 'fan', token);
    setEventData(eventData, token, 'fan');
    setAccessGranted(true);
    setTimeout(() => {
      navigate(`/event/${slug}/fan`, { replace: true });
    }, TIMINGS.GATE_REDIRECT_NORMAL);
  }

  /**
   * Handles the submission of a claim code.
   * Validates the code and grants access if successful.
   * @param {Event} e - Form submit event
   */
  async function handleCodeSubmit(e) {
    e.preventDefault();
    if (!claimCode.trim() || validating) return;

    setValidating(true);
    setCodeError(null);

    const result = await claimEventCodeBySlug(slug, claimCode);

    if (!result.success) {
      setCodeError(result.error);
      setValidating(false);
      return;
    }

    // Code is valid and atomically claimed — grant access
    const updatedEvent = result.event || event;
    setEventData(updatedEvent, result.sessionToken, 'fan');
    setAccessGranted(true);

    setTimeout(() => {
      navigate(`/event/${slug}/fan`, { replace: true });
    }, TIMINGS.GATE_REDIRECT_NORMAL);
  }

  /**
   * Formats the event ISO date string into a localized human-readable string.
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted date
   */
  function formatEventDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Loading state
  if (loading) {
    return (
      <div className="gate-container">
        <div className="gate-bg" />
        <div className="gate-content">
          <div className="gate-loading" role="status">
            <Loader2 size={40} className="gate-spinner" aria-hidden="true" />
            <p>Loading event...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (event not found)
  if (error && !event) {
    return (
      <div className="gate-container">
        <div className="gate-bg" />
        <div className="gate-content">
          <div className="gate-card gate-error-card glass-card">
            <div className="gate-error-icon">
              <XCircle size={48} />
            </div>
            <h2>Event Not Found</h2>
            <p>{error}</p>
            <p className="gate-error-hint">
              The event link may be invalid or the event may have been removed.
            </p>
            <button className="gate-btn gate-btn--secondary" onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access granted — transition
  if (accessGranted) {
    return (
      <div className="gate-container">
        <div className="gate-bg gate-bg--success" />
        <div className="gate-content">
          <div className="gate-card gate-success-card glass-card">
            <div className="gate-success-icon">
              <CheckCircle2 size={56} />
            </div>
            <h2>Access Granted</h2>
            <p>Welcome to {event?.name}</p>
            <div className="gate-redirect-bar">
              <div className="gate-redirect-fill" />
            </div>
            <p className="gate-redirect-text">Redirecting to AI Concierge...</p>
          </div>
        </div>
      </div>
    );
  }

  // Event is inactive
  if (error) {
    return (
      <div className="gate-container">
        <div className="gate-bg" />
        <div className="gate-content">
          <div className="gate-card gate-inactive-card glass-card">
            <Lock size={40} className="gate-lock-icon" />
            <h2>Event Inactive</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Time window checks
  const isUpcoming = timeStatus?.status === 'upcoming';
  const isExpired = timeStatus?.status === 'expired';
  const isLive = timeStatus?.status === 'active';

  return (
    <div className="gate-container">
      <div className="gate-bg" />
      <div className="gate-content">
        {/* Event Card */}
        <div className="gate-card glass-card">
          {/* Header Badge */}
          <div className="gate-card-badge">
            <Shield size={14} />
            <span>Secure Event Access</span>
          </div>

          {/* Event Info */}
          <div className="gate-event-info">
            <h1 className="gate-event-name">{event.name}</h1>
            {event.description && <p className="gate-event-desc">{event.description}</p>}

            <div className="gate-event-meta">
              <div className="gate-meta-item">
                <MapPin size={16} />
                <span>{event.venue}</span>
              </div>
              <div className="gate-meta-item">
                <CalendarDays size={16} />
                <span>{formatEventDate(event.event_date)}</span>
              </div>
              {event.max_capacity && (
                <div className="gate-meta-item">
                  <Users size={16} />
                  <span>{event.max_capacity.toLocaleString()} capacity</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`gate-status gate-status--${timeStatus?.status}`}>
            <Clock size={16} />
            <span>{timeStatus?.message}</span>
            {isLive && <span className="gate-live-dot" />}
          </div>

          {/* Upcoming — show countdown */}
          {isUpcoming && (
            <div className="gate-upcoming">
              <Clock size={20} />
              <div>
                <p className="gate-upcoming-label">Access opens at</p>
                <p className="gate-upcoming-time">{formatEventDate(event.starts_at)}</p>
              </div>
            </div>
          )}

          {/* Expired */}
          {isExpired && (
            <div className="gate-expired">
              <AlertCircle size={20} />
              <p>{"This event's access window has closed."}</p>
            </div>
          )}

          {/* Live + Requires Claim Code */}
          {isLive && event.require_claim_code && (
            <form className="gate-code-form" onSubmit={handleCodeSubmit}>
              <div className="gate-code-header">
                <Ticket size={18} />
                <span>Enter your access code</span>
              </div>
              <p className="gate-code-hint">
                Your unique code was provided with your ticket or invitation.
              </p>

              {/* Hackathon Quick-Try Assistant Pill */}
              <button
                type="button"
                className="gate-demo-pass-btn"
                onClick={() => {
                  setClaimCode('FAN-2026');
                  setCodeError(null);
                  if (codeInputRef.current) codeInputRef.current.focus();
                }}
              >
                <div className="gate-demo-pass-content">
                  <span className="gate-demo-pass-icon">⚡</span>
                  <div>
                    <strong className="gate-demo-pass-title">
                      Hackathon / Demo Pass Assistant
                    </strong>
                    <span className="gate-demo-pass-desc">
                      Click to auto-fill valid demo code:{' '}
                      <code className="gate-demo-pass-code">FAN-2026</code>
                    </span>
                  </div>
                </div>
                <span className="gate-demo-pass-action">
                  Auto-Fill →
                </span>
              </button>

              <div className="gate-code-input-row">
                <div className="gate-code-input-wrapper">
                  <KeyRound size={18} className="gate-code-icon" />
                  <input
                    ref={codeInputRef}
                    type="text"
                    className="gate-code-input"
                    value={claimCode}
                    onChange={(e) => {
                      setClaimCode(e.target.value.toUpperCase());
                      setCodeError(null);
                    }}
                    placeholder="FAN-XXXX"
                    maxLength={10}
                    autoComplete="off"
                    disabled={validating}
                    aria-label="Enter your claim code"
                  />
                </div>
                <button
                  type="submit"
                  className="gate-btn gate-btn--primary"
                  disabled={!claimCode.trim() || validating}
                >
                  {validating ? (
                    <Loader2 size={18} className="gate-spinner" />
                  ) : (
                    <>
                      <span>Verify</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
              {codeError && (
                <div className="gate-code-error">
                  <AlertCircle size={14} />
                  <span>{codeError}</span>
                </div>
              )}
            </form>
          )}

          {/* Live + No claim code required — auto-granting (shows briefly) */}
          {isLive && !event.require_claim_code && (
            <div className="gate-auto-access">
              <Loader2 size={20} className="gate-spinner" />
              <span>Verifying access...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="gate-footer">
          <Shield size={14} />
          <span>Powered by Aficionado AI — Secure Event Access</span>
        </div>
      </div>
    </div>
  );
}

export default EventGate;
