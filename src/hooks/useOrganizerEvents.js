/**
 * Custom hook to manage organizer dashboard event state, session counts, and claim codes.
 * @module useOrganizerEvents
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllEvents,
  getActiveSessionCount,
  getClaimCodes,
  toggleEventActive,
  deleteEvent,
  generateClaimCodes,
} from '../services/eventService';

export function useOrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [eventCodes, setEventCodes] = useState({});
  const [sessionCounts, setSessionCounts] = useState({});

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
      for (const event of result.data) {
        loadSessionCount(event.id);
      }
    }
    setLoading(false);
  }, [loadSessionCount]);

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
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.'))
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

  return {
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
  };
}
