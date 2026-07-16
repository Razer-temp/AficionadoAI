/**
 * Event Access Service — Supabase operations for event management.
 * Handles events, claim codes, and session tracking.
 * @module eventService
 */

export { loginOrganizer, signupOrganizer, logoutOrganizer, getOrganizerSession } from './authService';
export { createEvent, getEventBySlug, getAllEvents, toggleEventActive, deleteEvent } from './eventCoreService';
export { generateClaimCodes, getClaimCodes, validateClaimCode, claimEventCodeBySlug, verifyOpsKeyBySlug } from './claimCodeService';
export { createSession, getActiveSessionCount } from './sessionService';
export { checkEventTimeWindow, generateSlug } from './eventHelpers';
