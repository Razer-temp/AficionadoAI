/**
 * Unit tests for Event Service operations (Supabase Auth/DB + localStorage fallbacks).
 * @module tests/unit/eventService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Stub environment
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Use vi.hoisted to declare mock functions before they are used in the hoisted vi.mock
const { mockSignIn, mockSignUp, mockSignOut, mockGetSession, mockInsert, mockSelect, mockSingle } =
  vi.hoisted(() => {
    const mockUser = { id: 'org-user-456', email: 'org@example.com' };
    const mockSession = { user: mockUser };

    const mockSignInFn = vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
    const mockSignUpFn = vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null });
    const mockSignOutFn = vi.fn().mockResolvedValue({ error: null });
    const mockGetSessionFn = vi.fn().mockResolvedValue({ data: { session: mockSession } });

    const mockSingleFn = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockEqSingleFn = vi.fn().mockReturnValue({ single: mockSingleFn });
    const mockEqFn = vi.fn().mockReturnValue({ eq: mockEqSingleFn });
    const mockOrderFn = vi.fn().mockResolvedValue({ data: [], error: null });

    const mockSelectFn = vi.fn().mockReturnValue({
      eq: mockEqFn,
      single: mockSingleFn,
      order: mockOrderFn,
    });
    const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });

    return {
      mockSignIn: mockSignInFn,
      mockSignUp: mockSignUpFn,
      mockSignOut: mockSignOutFn,
      mockGetSession: mockGetSessionFn,
      mockInsert: mockInsertFn,
      mockSelect: mockSelectFn,
      mockSingle: mockSingleFn,
    };
  });

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn().mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getSession: mockGetSession,
      },
      from: vi.fn().mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      }),
    }),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Import all functions from the service
import {
  loginOrganizer,
  signupOrganizer,
  logoutOrganizer,
  getOrganizerSession,
  createEvent,
  getEventBySlug,
  claimEventCodeBySlug,
  verifyOpsKeyBySlug,
  getActiveSessionCount,
  getAllEvents,
  checkEventTimeWindow,
  toggleEventActive,
  deleteEvent,
  generateClaimCodes,
  getClaimCodes,
  validateClaimCode,
  createSession,
  generateSlug,
} from '../../src/services/eventService.js';

describe('Organizer Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginOrganizer calls signInWithPassword', async () => {
    mockSignIn.mockResolvedValueOnce({ data: { user: { id: 'org-user-456' } }, error: null });
    const result = await loginOrganizer('org@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.data.user.id).toBe('org-user-456');
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'org@example.com', password: 'password123' });
  });

  it('loginOrganizer handles errors gracefully', async () => {
    mockSignIn.mockResolvedValueOnce({ data: null, error: new Error('Invalid credentials') });
    const result = await loginOrganizer('org@example.com', 'wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('signupOrganizer calls signUp', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'org-user-456' } }, error: null });
    const result = await signupOrganizer('org@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(mockSignUp).toHaveBeenCalledWith({ email: 'org@example.com', password: 'password123' });
  });

  it('logoutOrganizer calls signOut', async () => {
    mockSignOut.mockResolvedValueOnce({ error: null });
    const result = await logoutOrganizer();
    expect(result.success).toBe(true);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('getOrganizerSession retrieves session', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: 'org-user-456' } } } });
    const result = await getOrganizerSession();
    expect(result.success).toBe(true);
    expect(result.user.id).toBe('org-user-456');
  });
});

describe('Event Operations', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('createEvent inserts to database and stores locally', async () => {
    const eventInput = {
      name: 'Test Stadium Match',
      venue: 'MetLife Arena',
      eventDate: '2026-07-20',
      startsAt: '18:00',
      endsAt: '22:00',
      slug: 'test-slug',
      requireClaimCode: true,
      opsAccessKey: 'KEY123',
    };

    mockSingle.mockResolvedValueOnce({ data: { id: 'evt-123', ...eventInput }, error: null });

    const result = await createEvent(eventInput);
    expect(result.success).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('getEventBySlug checks fallbacks and returns correct event', async () => {
    const result = await getEventBySlug('metlife-opener');
    expect(result.success).toBe(true);
    expect(result.data.slug).toBe('metlife-opener');
  });

  it('claimEventCodeBySlug validates access windows and claim codes', async () => {
    const result = await claimEventCodeBySlug('metlife-opener', 'FAN-2026');
    expect(result.success).toBe(true);

    const badResult = await claimEventCodeBySlug('metlife-opener', 'NO');
    expect(badResult.success).toBe(false);
  });

  it('verifyOpsKeyBySlug returns true for correct key', async () => {
    const result = await verifyOpsKeyBySlug('metlife-opener', 'FIFA2026OPS');
    expect(result.success).toBe(true);

    const badResult = await verifyOpsKeyBySlug('metlife-opener', 'BAD-KEY');
    expect(badResult.success).toBe(false);
  });

  it('getActiveSessionCount computes statistics for events', async () => {
    const res = await getActiveSessionCount('metlife-opener');
    expect(res.success).toBe(true);
    expect(typeof res.count).toBe('number');
  });

  it('getAllEvents combines demo and local events', async () => {
    const res = await getAllEvents();
    expect(res.success).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  });

  it('checkEventTimeWindow validates timeframe', () => {
    const now = new Date();
    const event = {
      starts_at: new Date(now.getTime() - 3600 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 3600 * 1000).toISOString(),
    };
    const check = checkEventTimeWindow(event);
    expect(check.isOpen).toBe(true);
  });

  it('toggleEventActive changes state of local/demo events', async () => {
    const result = await toggleEventActive('metlife-opener', false);
    expect(result.success).toBe(true);
  });

  it('deleteEvent removes event from storage', async () => {
    const result = await deleteEvent('metlife-opener');
    expect(result.success).toBe(true);
  });

  it('generateClaimCodes produces list of access tokens', async () => {
    const result = await generateClaimCodes('metlife-opener', 5);
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);
  });

  it('getClaimCodes lists codes for event', async () => {
    const result = await getClaimCodes('metlife-opener');
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('validateClaimCode checks individual code details', async () => {
    const result = await validateClaimCode('metlife-opener', 'FAN-2026');
    expect(result.success).toBe(true);
    expect(result.sessionToken).toBeDefined();
  });

  it('createSession registers session state', async () => {
    const result = await createSession('metlife-opener', 'fan', 'sess-token-456');
    expect(result.success).toBe(true);
  });

  it('generateSlug creates clean url friendly slug', () => {
    const slug = generateSlug('MetLife Stadium Opener Match', '2026-07-20');
    expect(slug).toContain('metlife-stadium-opener-match');
  });
});
