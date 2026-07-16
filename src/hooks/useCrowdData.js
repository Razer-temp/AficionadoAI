/**
 * Custom hook for managing the crowd data manager state and simulated incidents.
 * @module useCrowdData
 */

import { useState, useEffect, useCallback } from 'react';
import { createCrowdDataManager } from '../data/mockCrowdData';
import { getCurrentWeather, nextWeatherSnapshot } from '../data/mockWeatherData';

// Create crowd data manager (singleton for the ops view)
const crowdManager = createCrowdDataManager();

export function useCrowdData() {
  const [crowdSnapshot, setCrowdSnapshot] = useState(crowdManager.getCurrentSnapshot());
  const [weatherSnapshot, setWeatherSnapshot] = useState(getCurrentWeather());
  const [isIncident, setIsIncident] = useState(false);
  const [counterDroneAlert, setCounterDroneAlert] = useState(false);

  // Rotate crowd and weather data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      crowdManager.nextSnapshot();
      setCrowdSnapshot(crowdManager.getCurrentSnapshot());
      setWeatherSnapshot(nextWeatherSnapshot());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /** Simulate an incident (crowd surge at Gate C) */
  const handleSimulate = useCallback(() => {
    crowdManager.simulateIncident();
    setIsIncident(true);
    setCrowdSnapshot(crowdManager.getCurrentSnapshot());
  }, []);

  /** Clear the simulated incident */
  const handleClear = useCallback(() => {
    crowdManager.clearIncident();
    setIsIncident(false);
    setCrowdSnapshot(crowdManager.getCurrentSnapshot());
  }, []);

  return {
    crowdSnapshot,
    weatherSnapshot,
    isIncident,
    counterDroneAlert,
    setCounterDroneAlert,
    handleSimulate,
    handleClear,
  };
}
