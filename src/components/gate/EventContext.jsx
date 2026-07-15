/* eslint-disable react-refresh/only-export-components */
/**
 * Event Context — Provides event-scoped data to child components.
 * Used within event-gated routes to share event info and session token.
 * @module EventContext
 */

import { createContext, useContext, useState, useCallback } from 'react';

const EventContext = createContext(null);

/**
 * Provider component for event-scoped data.
 * @param {{ children: React.ReactNode }} props
 */
export function EventProvider({ children }) {
  const [event, setEvent] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [role, setRole] = useState(null);

  const setEventData = useCallback((eventData, token, userRole) => {
    setEvent(eventData);
    setSessionToken(token);
    setRole(userRole);

    // Persist to sessionStorage for page refreshes
    if (eventData && token) {
      sessionStorage.setItem(`afic_event_${eventData.slug}`, JSON.stringify({
        event: eventData,
        sessionToken: token,
        role: userRole,
      }));
    }
  }, []);

  const loadFromStorage = useCallback((slug) => {
    try {
      const stored = sessionStorage.getItem(`afic_event_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEvent(parsed.event);
        setSessionToken(parsed.sessionToken);
        setRole(parsed.role);
        return parsed;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }, []);

  const clearEventData = useCallback(() => {
    if (event?.slug) {
      sessionStorage.removeItem(`afic_event_${event.slug}`);
    }
    setEvent(null);
    setSessionToken(null);
    setRole(null);
  }, [event]);

  return (
    <EventContext.Provider value={{
      event,
      sessionToken,
      role,
      setEventData,
      loadFromStorage,
      clearEventData,
    }}>
      {children}
    </EventContext.Provider>
  );
}

/**
 * Hook to access event context data.
 * @returns {{ event: object|null, sessionToken: string|null, role: string|null, setEventData: Function, loadFromStorage: Function, clearEventData: Function }}
 */
export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    // Return defaults if outside provider (e.g., direct /fan route)
    return {
      event: null,
      sessionToken: null,
      role: null,
      setEventData: () => {},
      loadFromStorage: () => null,
      clearEventData: () => {},
    };
  }
  return context;
}

export default EventContext;
