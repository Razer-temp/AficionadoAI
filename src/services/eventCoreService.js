import { supabase } from './supabase';
import { getLocalEvents, saveLocalEvent, getFallbackEventBySlugOrId, DEMO_EVENTS } from './eventData';
import { safeSetLocal } from './storageHelper';

export async function createEvent(data) {
  const newEvent = {
    id: 'evt-' + crypto.randomUUID(),
    name: data.name,
    venue: data.venue || 'MetLife Stadium',
    description: data.description || null,
    event_date: data.eventDate,
    starts_at: data.startsAt,
    ends_at: data.endsAt,
    slug: data.slug,
    require_claim_code: data.requireClaimCode || false,
    ops_access_key: data.opsAccessKey || 'FIFA2026OPS',
    max_capacity: data.maxCapacity || null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  saveLocalEvent(newEvent);

  if (!supabase) return { success: true, data: newEvent };

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const organizerId = sessionData?.session?.user?.id || null;

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...newEvent,
        organizer_id: organizerId,
      })
      .select()
      .single();

    if (error) {
      console.warn(
        '[EventService] Supabase createEvent failed, using local storage fallback:',
        error.message,
      );
      return { success: true, data: newEvent };
    }
    return { success: true, data: event || newEvent };
  } catch (err) {
    console.warn('[EventService] createEvent fallback:', err.message);
    return { success: true, data: newEvent };
  }
}

export async function getEventBySlug(slug) {
  const cleanSlug = (slug || '').toLowerCase().trim();

  if (DEMO_EVENTS[cleanSlug]) {
    return { success: true, data: { ...DEMO_EVENTS[cleanSlug] } };
  }

  const localMatch = getFallbackEventBySlugOrId(cleanSlug);
  if (localMatch) {
    return { success: true, data: localMatch };
  }

  if (supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_event_by_slug', {
        p_slug: cleanSlug,
      });
      if (!rpcError && rpcData) {
        return { success: true, data: rpcData };
      }

      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', cleanSlug)
        .single();

      if (!error && event) {
        return { success: true, data: event };
      }
    } catch (err) {
      console.warn('[EventService] getEventBySlug cloud lookup error:', err.message);
    }
  }

  return { success: false, error: 'Event not found' };
}

export async function getAllEvents() {
  const demoList = Object.values(DEMO_EVENTS);
  const localList = getLocalEvents();
  let cloudList = [];

  if (supabase) {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && events) {
        cloudList = events;
      }
    } catch (err) {
      console.warn('[EventService] getAllEvents cloud lookup error:', err.message);
    }
  }

  const seenMap = new Map();
  for (const item of [...cloudList, ...localList, ...demoList]) {
    const key = item.slug || item.id;
    if (!seenMap.has(key)) {
      seenMap.set(key, item);
    }
  }

  const merged = Array.from(seenMap.values()).sort((a, b) => {
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return { success: true, data: merged };
}

export async function toggleEventActive(eventId, isActive) {
  for (const key of Object.keys(DEMO_EVENTS)) {
    if (DEMO_EVENTS[key].id === eventId || DEMO_EVENTS[key].slug === eventId) {
      DEMO_EVENTS[key].is_active = isActive;
      return { success: true };
    }
  }

  const locals = getLocalEvents();
  const updatedLocals = locals.map((e) =>
    e.id === eventId || e.slug === eventId ? { ...e, is_active: isActive } : e,
  );
  safeSetLocal('afic_custom_events', updatedLocals);

  if (supabase) {
    try {
      await supabase.from('events').update({ is_active: isActive }).eq('id', eventId);
    } catch {
      // ignore
    }
  }

  return { success: true };
}

export async function deleteEvent(eventId) {
  for (const key of Object.keys(DEMO_EVENTS)) {
    if (DEMO_EVENTS[key].id === eventId || DEMO_EVENTS[key].slug === eventId) {
      delete DEMO_EVENTS[key];
      return { success: true };
    }
  }

  const locals = getLocalEvents();
  const filtered = locals.filter((e) => e.id !== eventId && e.slug !== eventId);
  safeSetLocal('afic_custom_events', filtered);

  if (supabase) {
    try {
      await supabase.from('events').delete().eq('id', eventId);
    } catch {
      // ignore
    }
  }

  return { success: true };
}
