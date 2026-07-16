import { describe, it, expect, beforeEach } from 'vitest';
import { createCrowdDataManager, getDensityLevel } from '../../src/data/mockCrowdData';
import { CROWD_THRESHOLDS } from '../../src/utils/constants';

describe('mockCrowdData', () => {
  describe('getDensityLevel', () => {
    it('returns low threshold for density <= 40', () => {
      expect(getDensityLevel(20)).toEqual(CROWD_THRESHOLDS.low);
      expect(getDensityLevel(40)).toEqual(CROWD_THRESHOLDS.low);
    });

    it('returns medium threshold for 41 <= density <= 70', () => {
      expect(getDensityLevel(41)).toEqual(CROWD_THRESHOLDS.medium);
      expect(getDensityLevel(60)).toEqual(CROWD_THRESHOLDS.medium);
      expect(getDensityLevel(70)).toEqual(CROWD_THRESHOLDS.medium);
    });

    it('returns high threshold for 71 <= density <= 85', () => {
      expect(getDensityLevel(71)).toEqual(CROWD_THRESHOLDS.high);
      expect(getDensityLevel(80)).toEqual(CROWD_THRESHOLDS.high);
      expect(getDensityLevel(85)).toEqual(CROWD_THRESHOLDS.high);
    });

    it('returns critical threshold for density > 85', () => {
      expect(getDensityLevel(86)).toEqual(CROWD_THRESHOLDS.critical);
      expect(getDensityLevel(100)).toEqual(CROWD_THRESHOLDS.critical);
    });
  });

  describe('createCrowdDataManager', () => {
    let manager;

    beforeEach(() => {
      manager = createCrowdDataManager();
    });

    it('initializes with the first snapshot', () => {
      const snapshot = manager.getCurrentSnapshot();
      expect(snapshot.label).toBe('Pre-Game (Gates Opening)');
      expect(snapshot.simulated).toBe(true);
      expect(snapshot.incidentActive).toBe(false);
      expect(manager.getSnapshotIndex()).toBe(0);
    });

    it('cycles through snapshots when nextSnapshot is called', () => {
      expect(manager.getSnapshotIndex()).toBe(0);
      
      manager.nextSnapshot();
      expect(manager.getSnapshotIndex()).toBe(1);
      expect(manager.getCurrentSnapshot().label).toBe('Entry Rush (1hr Before Kickoff)');
      
      // Cycle through to the end
      manager.nextSnapshot(); // 2
      manager.nextSnapshot(); // 3
      manager.nextSnapshot(); // 4
      manager.nextSnapshot(); // 5
      expect(manager.getSnapshotIndex()).toBe(5);
      
      // Loop back to 0
      manager.nextSnapshot();
      expect(manager.getSnapshotIndex()).toBe(0);
    });

    it('applies incident overlay correctly', () => {
      // Setup base state
      const initialSnapshot = manager.getCurrentSnapshot();
      const gateCBefore = initialSnapshot.zones.find(z => z.id === 'gate-c').density;
      
      expect(gateCBefore).toBe(38);
      expect(manager.isIncidentActive()).toBe(false);

      // Simulate incident
      manager.simulateIncident();
      expect(manager.isIncidentActive()).toBe(true);
      
      const incidentSnapshot = manager.getCurrentSnapshot();
      const gateCAfter = incidentSnapshot.zones.find(z => z.id === 'gate-c').density;
      const concourse100After = incidentSnapshot.zones.find(z => z.id === 'concourse-100').density;
      
      // Values should reflect the incident overlay
      expect(gateCAfter).toBe(95);
      expect(concourse100After).toBe(80);
      
      // Gate A should be unaffected
      const gateAAfter = incidentSnapshot.zones.find(z => z.id === 'gate-a').density;
      expect(gateAAfter).toBe(55);

      // Clear incident
      manager.clearIncident();
      expect(manager.isIncidentActive()).toBe(false);
      
      const clearedSnapshot = manager.getCurrentSnapshot();
      const gateCCleared = clearedSnapshot.zones.find(z => z.id === 'gate-c').density;
      expect(gateCCleared).toBe(38); // Back to normal
    });
  });
});
