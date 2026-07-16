import PropTypes from 'prop-types';
/**
 * CreateEventModal — Modal for organizers to create a new event.
 * @module CreateEventModal
 */

import { useState } from 'react';
import { Plus, X, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { createEvent, generateSlug } from '../../services/eventService';

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

    if (field === 'eventDate' && value) {
      const eventDate = new Date(value);
      const startsAt = new Date(eventDate.getTime() - 4 * 60 * 60 * 1000);
      const endsAt = new Date(eventDate.getTime() + 5 * 60 * 60 * 1000);
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

          {error && (
            <div className="org-form-error" role="alert">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

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


CreateEventModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

export default CreateEventModal;
