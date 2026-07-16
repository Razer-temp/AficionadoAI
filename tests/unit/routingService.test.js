/**
 * Unit tests for routingService.js
 * Verifies Dijkstra graph traversal, step-free ADA accessibility filtering,
 * and localized zone name lookup.
 * @module tests/unit/routingService
 */

import { describe, it, expect } from 'vitest';
import {
  findShortestPath,
  getZoneName,
  STADIUM_GRAPH,
} from '../../src/services/engine/routingService.js';

describe('routingService', () => {
  describe('STADIUM_GRAPH', () => {
    it('constructs an adjacency graph with known gates and concourses', () => {
      expect(STADIUM_GRAPH).toHaveProperty('gate-a');
      expect(STADIUM_GRAPH).toHaveProperty('100-level-east');
      expect(STADIUM_GRAPH['gate-a'].length).toBeGreaterThan(0);
    });
  });

  describe('findShortestPath', () => {
    it('computes shortest path from gate-a to 100-level-east', () => {
      const result = findShortestPath('gate-a', '100-level-east', { stepFreeOnly: false });
      expect(result).toBeDefined();
      expect(result.found).toBe(true);
      expect(result.pathZones[0]).toBe('gate-a');
      expect(result.pathZones[result.pathZones.length - 1]).toBe('100-level-east');
      expect(result.distanceMeters).toBeGreaterThan(0);
    });

    it('returns stepFree: true when only step-free edges are traversed', () => {
      const result = findShortestPath('gate-a', '100-level-east', { stepFreeOnly: true });
      expect(result.found).toBe(true);
      expect(result.stepFree).toBe(true);
    });

    it('returns null when start or target node does not exist in graph', () => {
      const result = findShortestPath('gate-nonexistent', '100-level-east');
      expect(result).toBeNull();
    });

    it('returns 0 distance when start equals target', () => {
      const result = findShortestPath('gate-a', 'gate-a');
      expect(result.found).toBe(true);
      expect(result.distanceMeters).toBe(0);
      expect(result.pathZones).toEqual(['gate-a']);
    });
  });

  describe('getZoneName', () => {
    it('returns English localized name by default or when requested', () => {
      const name = getZoneName('gate-a', 'en');
      expect(name).toContain('Gate A');
    });

    it('returns Spanish localized name when es requested', () => {
      const name = getZoneName('gate-a', 'es');
      expect(name).toContain('Puerta A');
    });

    it('falls back to zoneId when unknown zone passed', () => {
      expect(getZoneName('unknown-zone-123')).toBe('unknown-zone-123');
    });
  });
});
