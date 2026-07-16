import { safeGetLocal, safeSetLocal } from './storageHelper';

const now = new Date();

export const DEMO_EVENTS = {
  'metlife-opener': {
    id: 'demo-event-metlife-opener-2026',
    name: 'FIFA World Cup 2026 — MetLife Stadium Opener',
    venue: 'MetLife Stadium (East Rutherford, NJ)',
    description:
      'Opening match of the FIFA World Cup 2026 at MetLife Stadium. Features secure time windows, claim code verification (FAN-2026), 4-Language AI Concierge, and live Ops synchronization.',
    event_date: new Date(now.getTime() - 2 * 3600 * 1000).toISOString().slice(0, 10),
    starts_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    ends_at: new Date(now.getTime() + 8 * 3600 * 1000).toISOString(),
    slug: 'metlife-opener',
    require_claim_code: true,
    ops_access_key: 'FIFA2026OPS',
    max_capacity: 82500,
    is_active: true,
    created_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
  },
  'fifa-final-2026': {
    id: 'demo-event-fifa-final-2026',
    name: 'World Cup Final 2026 — VIP Championship Gate',
    venue: 'MetLife Stadium — Championship Suite & Concourse Level 1',
    description:
      'The grand finale of the 2026 FIFA World Cup. Zero-friction instant access VIP concierge with real-time topology routing, executive menu verification, and step-free WCAG AA priority lanes.',
    event_date: new Date(now.getTime() - 1 * 3600 * 1000).toISOString().slice(0, 10),
    starts_at: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
    ends_at: new Date(now.getTime() + 6 * 3600 * 1000).toISOString(),
    slug: 'fifa-final-2026',
    require_claim_code: false,
    ops_access_key: 'FINAL-VIP-OPS',
    max_capacity: 82500,
    is_active: true,
    created_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString(),
  },
};

export function getLocalEvents() {
  return safeGetLocal('afic_custom_events', []);
}

export function saveLocalEvent(event) {
  const current = getLocalEvents();
  const updated = [event, ...current.filter((e) => e.id !== event.id && e.slug !== event.slug)];
  safeSetLocal('afic_custom_events', updated);
}

export function getFallbackEventBySlugOrId(identifier) {
  const cleanSlug = (identifier || '').toLowerCase().trim();
  if (DEMO_EVENTS[cleanSlug]) return { ...DEMO_EVENTS[cleanSlug] };
  const locals = getLocalEvents();
  const found = locals.find((e) => e.slug?.toLowerCase() === cleanSlug || e.id === identifier);
  return found ? { ...found } : null;
}
