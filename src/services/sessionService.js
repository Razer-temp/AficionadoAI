import { supabase } from './supabase';
import { safeGetLocal, safeSetLocal } from './storageHelper';
import { DEMO_EVENTS } from './eventData';

export async function createSession(eventId, role, sessionToken) {
  const current = Number(safeGetLocal(`afic_sess_${eventId}`, 0));
  safeSetLocal(`afic_sess_${eventId}`, String(current + 1));

  if (supabase) {
    try {
      await supabase.from('event_sessions').insert({
        event_id: eventId,
        session_token: sessionToken,
        role,
        is_active: true,
      });
    } catch {
      // ignore
    }
  }

  return { success: true };
}

export async function getActiveSessionCount(eventId) {
  if (eventId === DEMO_EVENTS['metlife-opener']?.id || eventId === 'metlife-opener') {
    return { success: true, count: 1420 };
  }
  if (eventId === DEMO_EVENTS['fifa-final-2026']?.id || eventId === 'fifa-final-2026') {
    return { success: true, count: 2845 };
  }

  let localCount = 12;
  const stored = Number(safeGetLocal(`afic_sess_${eventId}`, 0));
  localCount += stored;

  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('event_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('is_active', true);

      if (!error && typeof count === 'number') {
        return { success: true, count: count || localCount };
      }
    } catch {
      // ignore
    }
  }

  return { success: true, count: localCount };
}
