/**
 * Unit tests for contextEngine.js
 * Verifies business-rules engine logic: facility resolution, Dijkstra routing,
 * kickoff countdown urgency (< 15m), and live crowd detours before any LLM calls.
 * @module tests/unit/contextEngine
 */

import { describe, it, expect } from 'vitest';
import { buildDecision } from '../../src/services/engine/contextEngine.js';
import venueKnowledge from '../../venue-knowledge.json';

describe('contextEngine buildDecision', () => {
  describe('Facility & Intent Resolution', () => {
    it('resolves explicit destinationIntent for first_aid above keyword matching', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        destinationIntent: 'first_aid',
        question: 'Where can I get some food?',
      }, venueKnowledge);

      expect(decision.targetFacility).toBeDefined();
      expect(decision.intents).toContain('first_aid');
      expect(decision.targetFacility.name).toContain('First Aid Station');
    });

    it('resolves facility by keyword in English question when destinationIntent is empty', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        question: 'Where are the wheelchair accessible elevators or bathrooms?',
      }, venueKnowledge);

      expect(decision.targetFacility).toBeDefined();
      expect(decision.intents).toContain('restroom');
      expect(decision.targetFacility.accessible).toBe(true);
    });

    it('resolves facility by keyword in Spanish question', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        question: '¿Dónde está la puerta C?',
        language: 'es',
      }, venueKnowledge);

      expect(decision.targetFacility).toBeDefined();
      expect(decision.targetFacility.id).toBe('gate-c');
    });

    it('resolves seating section from ticketSection field', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        destinationIntent: 'seat',
        ticketSection: '314',
      }, venueKnowledge);

      expect(decision.targetFacility).toBeDefined();
      expect(decision.targetFacility.id).toBe('section-314');
      expect(decision.targetFacility.zone).toBe('300-level-south');
    });
  });

  describe('Kickoff Urgency Rule', () => {
    it('flags high urgency when kickoff is under 15 minutes away', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        minutesToKickoff: 10,
        question: 'How do I get to my seat in section 112?',
      });

      expect(decision.urgencyText).toBeDefined();
      expect(decision.urgencyText).toContain('Kickoff is in less than 15 minutes');
    });

    it('returns null urgencyText when kickoff is > 45 mins away', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        minutesToKickoff: 60,
        question: 'Where is food?',
      });

      expect(decision.urgencyText).toBeNull();
    });
  });

  describe('Crowd Detour Rule', () => {
    it('flags detour and reroutes gate when target gate density exceeds 75%', () => {
      const mockCrowd = {
        zones: [
          { id: 'gate-a', density: 90 },
          { id: 'gate-c', density: 30 },
        ],
      };
      const decision = buildDecision({
        currentLocation: 'concourse-100',
        destinationIntent: 'gate',
        question: 'How do I get out through Gate A?',
      }, venueKnowledge, mockCrowd);

      expect(decision.crowdLevel).toBe('high');
      expect(decision.detourNotice).toBeDefined();
      expect(decision.detourNotice).toContain('Heavy Surge');
      expect(decision.targetFacility.id).toBe('gate-c');
    });

    it('returns low crowdLevel when crowd density is below threshold', () => {
      const mockCrowd = {
        zones: [
          { id: 'gate-a', density: 30 },
        ],
      };
      const decision = buildDecision({
        currentLocation: 'concourse-100',
        question: 'Where is Gate A?',
      }, venueKnowledge, mockCrowd);

      expect(decision.crowdLevel).toBe('low');
      expect(decision.detourNotice).toBeNull();
    });
  });

  describe('Step-Free ADA Routing', () => {
    it('enforces step-free routing when accessibilityMode is wheelchair or query asks for step-free', () => {
      const decision = buildDecision({
        currentLocation: 'gate-a',
        accessibilityMode: 'wheelchair',
        destinationIntent: 'seat',
        ticketSection: '210',
      });

      expect(decision.accessibilityMode).toBe('wheelchair');
      expect(decision.route.found).toBe(true);
      expect(decision.route.stepFree).toBe(true);
    });
  });
});
