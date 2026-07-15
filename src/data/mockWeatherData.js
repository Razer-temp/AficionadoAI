/**
 * Mock weather data generator for MetLife Stadium (East Rutherford, NJ)
 * during FIFA World Cup 2026 matchdays (June/July summer weather).
 * @module data/mockWeatherData
 */

const WEATHER_CONDITIONS = [
  {
    condition: 'Sunny',
    icon: '☀️',
    tempC: 28,
    tempF: 82,
    humidity: 55,
    windKph: 12,
    windDirection: 'SSW',
    uvIndex: 8,
    precipitationChance: 10,
    status: 'OPTIMAL',
    alert: null,
  },
  {
    condition: 'Partly Cloudy',
    icon: '⛅',
    tempC: 30,
    tempF: 86,
    humidity: 65,
    windKph: 14,
    windDirection: 'SW',
    uvIndex: 7,
    precipitationChance: 20,
    status: 'OPTIMAL',
    alert: null,
  },
  {
    condition: 'Warm & Humid',
    icon: '🌤️',
    tempC: 33,
    tempF: 91,
    humidity: 78,
    windKph: 8,
    windDirection: 'S',
    uvIndex: 9,
    precipitationChance: 35,
    status: 'HEAT_ADVISORY',
    alert: 'Hydration stations active. High ambient humidity.',
  },
  {
    condition: 'Light Rain / Shower',
    icon: '🌧️',
    tempC: 25,
    tempF: 77,
    humidity: 88,
    windKph: 18,
    windDirection: 'E',
    uvIndex: 3,
    precipitationChance: 80,
    status: 'MONITORING',
    alert: 'Slick concourses possible. Covered gate entrance delays.',
  },
];

let currentIndex = 0;

/**
 * Returns the current simulated weather snapshot.
 * @returns {object} Weather condition object
 */
export function getCurrentWeather() {
  return WEATHER_CONDITIONS[currentIndex];
}

/**
 * Cycles to the next weather condition (simulating changing matchday weather).
 * @returns {object} New weather snapshot
 */
export function nextWeatherSnapshot() {
  currentIndex = (currentIndex + 1) % WEATHER_CONDITIONS.length;
  return WEATHER_CONDITIONS[currentIndex];
}

/**
 * Sets weather to a specific heat/storm alert state for testing ops response.
 * @param {number} index - Index in WEATHER_CONDITIONS
 * @returns {object} Weather condition object
 */
export function setWeatherState(index) {
  if (index >= 0 && index < WEATHER_CONDITIONS.length) {
    currentIndex = index;
  }
  return WEATHER_CONDITIONS[currentIndex];
}
