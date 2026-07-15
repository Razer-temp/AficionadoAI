/**
 * OpsGate — Operations staff access gate.
 * Validates the ops access key from URL query parameters
 * before granting access to the operations dashboard.
 * @module OpsGate
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEvent } from './EventContext';
import {
  getEventBySlug,
  verifyOpsKeyBySlug,
  createSession,
} from '../../services/eventService';
import {
  ShieldCheck,
  Lock,
  Loader2,
  XCircle,
  KeyRound,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import '../../styles/gate.css';

/**
 * Gate component for ops staff. Validates access key from query params.
 * Route: /event/:slug/ops?key=<ops_access_key>
 * @returns {JSX.Element}
 */
function OpsGate({ children }) {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { setEventData, loadFromStorage } = useEvent();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [event, setEvent] = useState(null);
  const [manualKey, setManualKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [keyError, setKeyError] = useState(null);

  useEffect(() => {
    // Check stored session first
    const stored = loadFromStorage(slug);
    if (stored?.sessionToken && stored?.role === 'ops') {
      setEvent(stored.event);
      setAuthorized(true);
      setLoading(false);
      return;
    }

    validateAccess();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  async function validateAccess() {
    setLoading(true);
    const key = searchParams.get('key');

    const result = await getEventBySlug(slug);

    if (!result.success || !result.data) {
      setError('Event not found');
      setLoading(false);
      return;
    }

    const eventData = result.data;
    setEvent(eventData);

    if (!eventData.is_active) {
      setError('This event is currently inactive');
      setLoading(false);
      return;
    }

    // If key is provided in URL, validate it automatically via secure RPC
    if (key) {
      const res = await verifyOpsKeyBySlug(slug, key);
      if (res.success) {
        await grantOpsAccess(res.event || eventData, res.sessionToken);
      } else {
        setKeyError(res.error || 'Invalid access key');
      }
    }

    setLoading(false);
  }

  async function grantOpsAccess(eventData, existingToken = null) {
    const token = existingToken || crypto.randomUUID();
    if (!existingToken) {
      await createSession(eventData.id, 'ops', token);
    }
    setEventData(eventData, token, 'ops');
    setAuthorized(true);
  }

  async function handleManualKeySubmit(e) {
    e.preventDefault();
    if (!manualKey.trim() || validating) return;

    setValidating(true);
    setKeyError(null);

    const res = await verifyOpsKeyBySlug(slug, manualKey.trim());
    if (res.success) {
      await grantOpsAccess(res.event || event, res.sessionToken);
    } else {
      setKeyError(res.error || 'Invalid access key');
    }

    setValidating(false);
  }

  if (loading) {
    return (
      <div className="gate-container gate-container--ops">
        <div className="gate-bg gate-bg--ops" />
        <div className="gate-content">
          <div className="gate-loading">
            <Loader2 size={40} className="gate-spinner" />
            <p>Verifying operations access...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gate-container gate-container--ops">
        <div className="gate-bg gate-bg--ops" />
        <div className="gate-content">
          <div className="gate-card gate-error-card glass-card">
            <div className="gate-error-icon">
              <XCircle size={48} />
            </div>
            <h2>{error === 'Event not found' ? 'Event Not Found' : 'Access Denied'}</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Authorized — render children (ops dashboard)
  if (authorized) {
    return children;
  }

  // Not authorized — show key input form
  return (
    <div className="gate-container gate-container--ops">
      <div className="gate-bg gate-bg--ops" />
      <div className="gate-content">
        <div className="gate-card glass-card">
          <div className="gate-card-badge gate-card-badge--ops">
            <ShieldCheck size={14} />
            <span>Operations Access</span>
          </div>

          <div className="gate-event-info">
            <h1 className="gate-event-name">{event?.name}</h1>
            <p className="gate-event-desc">Operations Command Center</p>
          </div>

          <form className="gate-code-form" onSubmit={handleManualKeySubmit}>
            <div className="gate-code-header">
              <Lock size={18} />
              <span>Enter operations access key</span>
            </div>
            <p className="gate-code-hint">
              This key was provided by the event organizer for authorized staff only.
            </p>

            {/* Hackathon Quick-Try Ops Key Pill */}
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#06b6d4',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.08)',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
              }}
              onClick={() => {
                const keyToUse = event?.ops_access_key || 'FIFA2026OPS';
                setManualKey(keyToUse);
                setKeyError(null);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <div>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '0.86rem' }}>Hackathon / Demo Ops Key Assistant</strong>
                  <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.78rem' }}>Click to auto-fill valid Ops key: <code style={{ color: '#67e8f9', fontWeight: 'bold' }}>{event?.ops_access_key || 'FIFA2026OPS'}</code></span>
                </div>
              </div>
              <span style={{ background: 'rgba(6, 182, 212, 0.22)', padding: '5px 10px', borderRadius: '6px', fontSize: '0.76rem', color: '#67e8f9', border: '1px solid rgba(6, 182, 212, 0.4)', whiteSpace: 'nowrap' }}>
                Auto-Fill →
              </span>
            </button>

            <div className="gate-code-input-row">
              <div className="gate-code-input-wrapper">
                <KeyRound size={18} className="gate-code-icon" />
                <input
                  type="password"
                  className="gate-code-input"
                  value={manualKey}
                  onChange={(e) => {
                    setManualKey(e.target.value);
                    setKeyError(null);
                  }}
                  placeholder="Ops access key"
                  autoComplete="off"
                  disabled={validating}
                  aria-label="Enter operations access key"
                />
              </div>
              <button
                type="submit"
                className="gate-btn gate-btn--ops"
                disabled={!manualKey.trim() || validating}
              >
                {validating ? (
                  <Loader2 size={18} className="gate-spinner" />
                ) : (
                  <>
                    <span>Authorize</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            {keyError && (
              <div className="gate-code-error">
                <AlertCircle size={14} />
                <span>{keyError}</span>
              </div>
            )}
          </form>

          <div className="gate-footer" style={{ marginTop: '1.5rem' }}>
            <ShieldCheck size={14} />
            <span>Restricted to authorized operations personnel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpsGate;
