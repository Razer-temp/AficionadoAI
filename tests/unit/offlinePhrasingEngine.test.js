/**
 * Unit tests for offlinePhrasingEngine.js
 * Verifies deterministic multilingual markdown generation and ops action plans
 * when running offline or without an API key.
 * @module tests/unit/offlinePhrasingEngine
 */

import { describe, it, expect } from 'vitest';
import {
  phraseFanResponse,
  generateOfflineBriefing,
} from '../../src/services/engine/offlinePhrasingEngine.js';

describe('offlinePhrasingEngine', () => {
  const mockDecision = {
    targetFacility: { name: 'Gate C (HCLTech Gate)' },
    route: {
      found: true,
      distanceMeters: 250,
      stepFree: true,
      instructions: [
        { order: 1, text: 'Proceed from Gate A along Main Walkway' },
        { order: 2, text: 'Arrive at Gate C (HCLTech Gate)' },
      ],
    },
    urgencyText: 'Critical kickoff timing',
    detourNotice: null,
    sustainabilityTip: 'Use recycling stations nearby',
    intents: ['wayfinding', 'accessibility'],
    sources: ['Gate Directory', 'Transit & Parking Guide'],
  };

  describe('phraseFanResponse', () => {
    it('returns formatted English response when language is en', () => {
      const resp = phraseFanResponse(mockDecision, 'Where is Gate C?', 'en');
      expect(resp.response).toContain('Gate C (HCLTech Gate)');
      expect(resp.response).toContain('250m');
      expect(resp.response).toContain('100% ADA Step-Free Verified Route');
      expect(resp.language).toBe('en');
      expect(resp.sources).toEqual(mockDecision.sources);
    });

    it('returns formatted Spanish response when language is es', () => {
      const resp = phraseFanResponse(mockDecision, '¿Dónde está la puerta C?', 'es');
      expect(resp.response).toContain('Gate C (HCLTech Gate)');
      expect(resp.response).toContain('250m');
      expect(resp.response).toContain('Guía Paso a Paso');
      expect(resp.language).toBe('es');
    });

    it('returns formatted French response when language is fr', () => {
      const resp = phraseFanResponse(mockDecision, 'Où est la porte C?', 'fr');
      expect(resp.response).toContain('Destination Recommandée');
      expect(resp.response).toContain('Itinéraire Étape par Étape');
      expect(resp.language).toBe('fr');
    });

    it('returns formatted Portuguese response when language is pt', () => {
      const resp = phraseFanResponse(mockDecision, 'Onde fica o portão C?', 'pt');
      expect(resp.response).toContain('Destino Recomendado');
      expect(resp.response).toContain('Guia Passo a Passo');
      expect(resp.language).toBe('pt');
    });

    it('includes detour warning if detourNotice is present in decision', () => {
      const decisionWithDetour = {
        ...mockDecision,
        detourNotice: 'HIGH CROWD DENSITY DETOUR: Gate C is at 95% density.',
      };
      const resp = phraseFanResponse(decisionWithDetour, 'Where is Gate C?', 'en');
      expect(resp.response).toContain('⚠️ **LIVE CROWD AVOIDANCE DETOUR:**');
      expect(resp.response).toContain('95% density');
    });

    it('gracefully handles missing route/facility', () => {
      const emptyDecision = { route: { found: false }, intents: ['general'], sources: [] };
      const resp = phraseFanResponse(emptyDecision, 'General question', 'en');
      expect(resp.response).toContain('AI concierge for FIFA World Cup 2026');
      expect(resp.sources).toEqual([]);
    });
  });

  describe('generateOfflineBriefing', () => {
    it('generates tactical dispatch status when crowd density > 85%', () => {
      const mockCrowd = {
        label: 'High Density',
        zones: [{ name: 'Gate C', density: 92, level: { label: 'Critical' } }],
      };
      const queries = [{ language: 'es', zone: 'gate-c', intentCategory: 'accessibility' }];
      const briefing = generateOfflineBriefing(mockCrowd, queries);
      expect(briefing.briefing).toContain('[STATUS: ACTION REQUIRED / TACTICAL DISPATCH]');
      expect(briefing.briefing).toContain('Gate C');
      expect(briefing.briefing).toContain('92%');
    });

    it('generates normal operations status when crowd density is low and no incidents', () => {
      const mockCrowd = {
        label: 'Nominal Flow',
        zones: [{ name: 'Gate A', density: 35, level: { label: 'Light' } }],
      };
      const briefing = generateOfflineBriefing(mockCrowd, []);
      expect(briefing.briefing).toContain('[STATUS: NORMAL OPERATIONS]');
    });
  });
});
