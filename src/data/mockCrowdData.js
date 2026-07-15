/**
 * Mock crowd density data system.
 * Generates simulated crowd sensor readings per gate/zone that rotate on a timer.
 * Data is clearly labeled as SIMULATED in the UI.
 * 
 * Uses JSON snapshot states rotating on a timer — lightweight, no busy-polling.
 * @module mockCrowdData
 */

import { ZONES, CROWD_THRESHOLDS } from '../utils/constants.js';

/**
 * Pre-defined crowd density snapshots representing different stadium states.
 * Each snapshot is a complete picture of all zones at a point in time.
 * Rotating through these creates a realistic-feeling demo without complex random generation.
 */
const CROWD_SNAPSHOTS = [
  // State 0: Pre-game — moderate at gates, low inside
  {
    label: 'Pre-Game (Gates Opening)',
    zones: {
      'gate-a': 55, 'gate-b': 42, 'gate-c': 38, 'gate-d': 45,
      'concourse-100': 20, 'concourse-200': 15, 'concourse-300': 10,
    },
  },
  // State 1: Rush hour — high at popular gates
  {
    label: 'Entry Rush (1hr Before Kickoff)',
    zones: {
      'gate-a': 82, 'gate-b': 68, 'gate-c': 75, 'gate-d': 58,
      'concourse-100': 55, 'concourse-200': 40, 'concourse-300': 35,
    },
  },
  // State 2: Near kickoff — critical at some gates
  {
    label: 'Near Kickoff',
    zones: {
      'gate-a': 92, 'gate-b': 78, 'gate-c': 88, 'gate-d': 65,
      'concourse-100': 72, 'concourse-200': 60, 'concourse-300': 55,
    },
  },
  // State 3: Match in progress — low at gates, moderate inside
  {
    label: 'Match In Progress',
    zones: {
      'gate-a': 15, 'gate-b': 12, 'gate-c': 10, 'gate-d': 18,
      'concourse-100': 35, 'concourse-200': 30, 'concourse-300': 25,
    },
  },
  // State 4: Halftime — surge at concessions
  {
    label: 'Halftime',
    zones: {
      'gate-a': 20, 'gate-b': 15, 'gate-c': 12, 'gate-d': 22,
      'concourse-100': 85, 'concourse-200': 78, 'concourse-300': 72,
    },
  },
  // State 5: Post-match exit rush
  {
    label: 'Post-Match Exit',
    zones: {
      'gate-a': 95, 'gate-b': 88, 'gate-c': 90, 'gate-d': 85,
      'concourse-100': 60, 'concourse-200': 55, 'concourse-300': 50,
    },
  },
];

/**
 * Incident overlay that can be applied on top of any snapshot
 * to simulate a crowd incident for demo purposes.
 */
const INCIDENT_OVERLAY = {
  'gate-c': 95,
  'concourse-100': 80,
};

/**
 * Gets the density level classification for a given percentage.
 * @param {number} density - Density percentage (0-100)
 * @returns {{ label: string, icon: string, color: string }}
 */
export function getDensityLevel(density) {
  if (density <= CROWD_THRESHOLDS.low.max) return CROWD_THRESHOLDS.low;
  if (density <= CROWD_THRESHOLDS.medium.max) return CROWD_THRESHOLDS.medium;
  if (density <= CROWD_THRESHOLDS.high.max) return CROWD_THRESHOLDS.high;
  return CROWD_THRESHOLDS.critical;
}

/**
 * Creates a crowd data manager that rotates through snapshots.
 * @returns {{ getCurrentSnapshot: Function, getSnapshotIndex: Function, nextSnapshot: Function, simulateIncident: Function, clearIncident: Function, isIncidentActive: Function }}
 */
export function createCrowdDataManager() {
  let currentIndex = 0;
  let incidentActive = false;

  /**
   * Gets the current crowd density snapshot with zone metadata.
   * @returns {{ label: string, timestamp: number, simulated: boolean, incidentActive: boolean, zones: Array<{ id: string, name: string, direction: string, density: number, level: object }> }}
   */
  function getCurrentSnapshot() {
    const snapshot = CROWD_SNAPSHOTS[currentIndex];
    const zones = ZONES.map((zone) => {
      let density = snapshot.zones[zone.id] || 0;

      // Apply incident overlay if active
      if (incidentActive && INCIDENT_OVERLAY[zone.id]) {
        density = Math.max(density, INCIDENT_OVERLAY[zone.id]);
      }

      return {
        ...zone,
        density,
        level: getDensityLevel(density),
      };
    });

    return {
      label: snapshot.label,
      timestamp: Date.now(),
      simulated: true,
      incidentActive,
      zones,
    };
  }

  /** Advances to the next snapshot in rotation. */
  function nextSnapshot() {
    currentIndex = (currentIndex + 1) % CROWD_SNAPSHOTS.length;
  }

  /** Gets the current snapshot index. @returns {number} */
  function getSnapshotIndex() {
    return currentIndex;
  }

  /** Activates the incident overlay (Gate C surge). */
  function simulateIncident() {
    incidentActive = true;
  }

  /** Deactivates the incident overlay. */
  function clearIncident() {
    incidentActive = false;
  }

  /** @returns {boolean} Whether an incident is currently simulated */
  function isIncidentActive() {
    return incidentActive;
  }

  return {
    getCurrentSnapshot,
    getSnapshotIndex,
    nextSnapshot,
    simulateIncident,
    clearIncident,
    isIncidentActive,
  };
}

/**
 * Formats crowd data snapshot as context for the Gemini briefing prompt.
 * @param {{ zones: Array }} snapshot - Current crowd snapshot
 * @returns {string} Formatted crowd data for LLM context
 */
export function formatCrowdDataForBriefing(snapshot) {
  const lines = [
    `CROWD DENSITY & TELEMETRY DATA (${snapshot.label}) — SIMULATED LENOVO AI HUB`,
    `Timestamp: ${new Date(snapshot.timestamp).toLocaleTimeString()}`,
    snapshot.incidentActive ? '🚨 INCIDENT / LIDAR SURGE SIMULATION ACTIVE AT GATE C' : 'ALL GATES NORMAL',
    '',
    ...snapshot.zones.map((z) =>
      `${z.name}: ${z.density}% capacity [Status: ${z.level.label}]`,
    ),
  ].filter(Boolean);

  return lines.join('\n');
}
