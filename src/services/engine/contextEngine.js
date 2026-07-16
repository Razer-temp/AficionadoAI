/**
 * Deterministic context engine — runs business rules BEFORE any LLM call.
 *
 * Resolves every fact (target facility, step-free route, live crowd detours, kickoff urgency,
 * and accessibility mode) purely from structured `UserContext` and stadium data, ensuring
 * zero LLM involvement in wayfinding safety or crowd detour decisions.
 *
 * @module contextEngine
 */

import venueKnowledge from '../../../venue-knowledge.json';
import { findShortestPath, getZoneName } from './routingService.js';
import {
  CROWD_REROUTE_THRESHOLD,
  CROWD_MODERATE_THRESHOLD,
  KICKOFF_URGENCY_MINUTES,
} from '../../utils/constants.js';

/**
 * Localized string templates for deterministic rules engine outputs.
 * Using a lookup table instead of repeated if/else chains improves maintainability.
 * @type {Record<string, Record<string, string>>}
 */
const TRANSLATIONS = {
  kickoffUrgency: {
    en: 'Kickoff is in less than 15 minutes! Use the express turnstile lane at your gate and proceed immediately to your seating section without stopping at concourse concessions.',
    es: '¡El partido comienza en menos de 15 minutos! Dirígete directamente a tu puerta por el carril expreso y ve a tu asiento sin detenerse en las concesiones del vestíbulo.',
    fr: "Le coup d'envoi est dans moins de 15 minutes ! Utilisez la file express à votre porte et rejoignez directement votre place sans vous arrêter aux stands de nourriture.",
    pt: 'O jogo começa em menos de 15 minutos! Dirija-se diretamente ao seu portão pela faixa expressa e vá para o seu assento sem parar nas lanchonetes.',
  },
  sustainabilityTransit: {
    en: 'NJ TRANSIT rail is the lowest carbon footprint option, moving up to 1,000 fans per train without traffic congestion.',
    es: 'El tren NJ TRANSIT es la opción de menor huella de carbono y transporta hasta 1,000 aficionados por viaje.',
    fr: "Le train NJ TRANSIT est l'option la plus écologique, transportant jusqu'à 1 000 supporters par trajet.",
    pt: 'O trem NJ TRANSIT é a opção com menor pegada de carbono, transportando até 1.000 torcedores por viagem.',
  },
  sustainabilityGeneral: {
    en: 'Refill your permitted 20oz water bottle for free at water refill stations located on all concourse levels.',
    es: 'Recuerda que puedes llenar tu botella de agua de 20oz gratis en las estaciones de recarga de todos los niveles.',
    fr: "Vous pouvez remplir gratuitement votre bouteille d'eau de 20 oz aux stations de remplissage de tous les niveaux.",
    pt: 'Você pode reabastecer sua garrafa de água de 20oz gratuitamente nas estações de refil em todos os níveis.',
  },
};

/**
 * Returns a localized string from the TRANSLATIONS dictionary.
 * Falls back to English if the requested language is not available.
 * @param {string} key - Translation key
 * @param {string} [language='en'] - Language code
 * @returns {string}
 */
function localize(key, language = 'en') {
  const entry = TRANSLATIONS[key];
  if (!entry) return '';
  return entry[language] || entry.en || '';
}

/**
 * @typedef {object} UserContext
 * @property {string} [currentLocation='gate-a'] - Current stadium zone ID
 * @property {string} [destinationIntent=''] - Destination intent (gate, restroom, first_aid, concession, sensory_room, water, seat)
 * @property {string} [accessibilityMode='standard'] - Accessibility mode (standard, wheelchair, screen_reader, captioned)
 * @property {number|null} [minutesToKickoff=null] - Minutes remaining until match kickoff
 * @property {string} [ticketSection=''] - Ticket section number (e.g. '124')
 * @property {string} [question=''] - Raw fan question
 * @property {string} [language='en'] - Detected or selected language code
 */

/**
 * @typedef {object} DecisionResult
 * @property {object|null} targetFacility - Resolved facility or gate object
 * @property {object|null} route - Computed shortest path and turn-by-turn instructions
 * @property {string} crowdLevel - Live crowd status at target facility ('low', 'medium', 'high')
 * @property {string} accessibilityMode - Active accessibility mode
 * @property {string|null} urgencyText - Kickoff countdown urgency warning if applicable
 * @property {string|null} sustainabilityTip - Contextual eco/transit recommendation
 * @property {string|null} detourNotice - Rerouting notice if high crowd detour occurred
 * @property {string[]} intents - Classified query intents
 * @property {string[]} sources - Verified knowledge base sources used
 * @property {string} language - Target language code
 */

/**
 * Runs the deterministic rules engine on a user context and returns verified decision facts.
 *
 * @param {UserContext} userContext - Fan matchday context input
 * @param {object} [customVenueData=venueKnowledge] - Venue dataset
 * @param {object|null} [crowdData=null] - Live crowd density snapshot
 * @returns {DecisionResult}
 */
export function buildDecision(userContext = {}, customVenueData = venueKnowledge, crowdData = null) {
  const {
    currentLocation = 'gate-a',
    destinationIntent = '',
    accessibilityMode = 'standard',
    minutesToKickoff = null,
    ticketSection = '',
    question = '',
    language = 'en',
  } = userContext;

  const lowerQ = (question || '').toLowerCase();

  // Step 1: Detect accessibility needs from mode or keyword triggers
  const isWheelchair =
    accessibilityMode === 'wheelchair' ||
    /\b(wheelchair|step-free|ramp|elevator|silla de ruedas|rampa|ascensor|ascenseur|rampe|cadeira de rodas)\b/.test(lowerQ);
  const isVisual =
    accessibilityMode === 'screen_reader' || /\b(blind|visual|screen reader|ciego|visual|aveugle|cego)\b/.test(lowerQ);
  const isHearing =
    accessibilityMode === 'captioned' || /\b(deaf|hearing|caption|sensory|sordo|audición|sourd|surdo)\b/.test(lowerQ);

  const activeMode = isWheelchair ? 'wheelchair' : isVisual ? 'screen_reader' : isHearing ? 'captioned' : accessibilityMode;
  const stepFreeOnly = isWheelchair || isVisual;

  // Step 2: Classify Intent if destinationIntent is not explicitly selected
  let resolvedIntent = destinationIntent;
  if (!resolvedIntent) {
    if (/\b(gates?|entry|entrances?|puertas?|entradas?|portes?)\b/.test(lowerQ)) resolvedIntent = 'gate';
    else if (/\b(restrooms?|bathrooms?|toilets?|baños?|aseos?|toilettes?|banheiros?)\b/.test(lowerQ)) resolvedIntent = 'restroom';
    else if (/\b(halal|food|eat|concessions?|hungry|shahs|kosher|comida|nourriture)\b/.test(lowerQ)) resolvedIntent = 'concession';
    else if (/\b(first aid|medical|doctor|headache|pain|emergency|emergencia|médecin|socorro)\b/.test(lowerQ)) resolvedIntent = 'first_aid';
    else if (/\b(sensory|quiet|autism|autismo|calm|sensorial)\b/.test(lowerQ)) resolvedIntent = 'sensory_room';
    else if (/\b(water|refill|bottles?|hydrate|agua|botella|eau|água)\b/.test(lowerQ)) resolvedIntent = 'water';
    else if (/\b(trains?|transit|nj transit|path|bus|shuttles?|parking|tren|autobús)\b/.test(lowerQ)) resolvedIntent = 'transit';
    else if (ticketSection || /\b(sections?|seats?|sección|secciones)\b/.test(lowerQ)) resolvedIntent = 'seat';
  }

  // Step 3: Resolve Target Facility & Zone
  let targetZoneId = '100-level-east';
  let targetFacility = null;
  const sources = ['venue-knowledge.json (deterministic rules engine)'];
  const intents = resolvedIntent ? [resolvedIntent] : ['general'];

  if (/\b(gate a|metlife gate|puerta a|porte a)\b/.test(lowerQ) || (resolvedIntent === 'gate' && !/\b(gate [bcd]|puerta [bcd]|porte [bcd])\b/.test(lowerQ))) {
    targetZoneId = 'gate-a';
    targetFacility = customVenueData.gates?.find((g) => g.id === 'gate-a') || { id: 'gate-a', name: 'MetLife Gate (Gate A)' };
  } else if (/\b(gate b|verizon|puerta b|porte b)\b/.test(lowerQ)) {
    targetZoneId = 'gate-b';
    targetFacility = customVenueData.gates?.find((g) => g.id === 'gate-b') || { id: 'gate-b', name: 'Verizon Gate (Gate B)' };
  } else if (/\b(gate c|hcltech|puerta c|porte c)\b/.test(lowerQ)) {
    targetZoneId = 'gate-c';
    targetFacility = customVenueData.gates?.find((g) => g.id === 'gate-c') || { id: 'gate-c', name: 'HCLTech Gate (Gate C)' };
  } else if (/\b(gate d|moodys|puerta d|porte d)\b/.test(lowerQ)) {
    targetZoneId = 'gate-d';
    targetFacility = customVenueData.gates?.find((g) => g.id === 'gate-d') || { id: 'gate-d', name: 'Moody\'s Gate (Gate D)' };
  } else if (resolvedIntent === 'restroom') {
    targetZoneId = currentLocation.includes('200') ? 'restroom-200-east' : 'restroom-100-east';
    targetFacility = { id: targetZoneId, name: 'ADA Accessible Restrooms', zone: targetZoneId, accessible: true };
  } else if (resolvedIntent === 'concession') {
    targetZoneId = 'halal-shahs';
    targetFacility = customVenueData.food?.find((f) => f.id === 'halal-shahs') || { id: 'halal-shahs', name: 'Shah\'s Halal Food Stand' };
  } else if (resolvedIntent === 'first_aid') {
    targetZoneId = currentLocation.includes('300') ? 'first-aid-301' : currentLocation.includes('south') ? 'first-aid-128' : 'first-aid-103';
    targetFacility = customVenueData.medical?.find((m) => m.id === targetZoneId) || { id: targetZoneId, name: 'First Aid Medical Station' };
  } else if (resolvedIntent === 'sensory_room') {
    targetZoneId = 'sensory-room-124';
    targetFacility = { id: 'sensory-room-124', name: 'Dedicated Low-Sensory Quiet Room (Section 124)', accessible: true };
  } else if (resolvedIntent === 'water') {
    targetZoneId = currentLocation.includes('300') ? 'water-refill-330' : 'water-refill-108';
    targetFacility = { id: targetZoneId, name: 'Free Water Bottle Refill Station', accessible: true };
  } else if (resolvedIntent === 'transit') {
    targetZoneId = 'nj-transit-station';
    targetFacility = customVenueData.transit?.find((t) => t.id === 'nj-transit-rail') || { id: 'nj-transit-rail', name: 'NJ TRANSIT Secaucus Rail Hub' };
  } else if (resolvedIntent === 'seat' || ticketSection) {
    const secNum = parseInt((ticketSection || question.match(/\b\d{3}\b/)?.[0] || '124').replace(/\D/g, ''), 10);
    if (secNum >= 300) targetZoneId = '300-level-south';
    else if (secNum >= 200) targetZoneId = '200-level-south';
    else targetZoneId = secNum >= 124 && secNum <= 137 ? '100-level-south' : '100-level-east';
    targetFacility = { id: `section-${secNum || '124'}`, name: `Seating Section ${secNum || '124'}`, zone: targetZoneId, accessible: true };
  }

  // Step 4: Check Live Crowd Rerouting / Detour Rule
  let detourNotice = null;
  let crowdLevel = 'low';

  if (crowdData && crowdData.zones && targetZoneId) {
    const zoneDensityObj = crowdData.zones.find((z) => z.id === targetZoneId || targetZoneId.includes(z.id) || z.name?.toLowerCase().includes(targetZoneId));
    if (zoneDensityObj) {
      const density = zoneDensityObj.density;
      if (density >= CROWD_REROUTE_THRESHOLD) {
        crowdLevel = 'high';
        // Rerouting rule for gates when target is high
        if (targetZoneId === 'gate-a' || targetZoneId === 'gate-b') {
          const alternativeGate = targetZoneId === 'gate-a' ? 'gate-c' : 'gate-d';
          const altDensityObj = crowdData.zones.find((z) => z.id === alternativeGate);
          const altDensity = altDensityObj?.density || 45;
          if (altDensity < density) {
            const detourTemplates = {
              en: `${getZoneName(targetZoneId, 'en')} is experiencing Heavy Surge (${density}% density). We have rerouted your directions to ${getZoneName(alternativeGate, 'en')} (${altDensity}% density) for faster entry.`,
              es: `La ${getZoneName(targetZoneId, 'es')} presenta alta aglomeración (${density}%). Te hemos redirigido a la ${getZoneName(alternativeGate, 'es')} (${altDensity}%) para un ingreso 3x más rápido.`,
              fr: `La ${getZoneName(targetZoneId, 'fr')} connaît une forte affluence (${density}%). Nous vous avons redirigé vers la ${getZoneName(alternativeGate, 'fr')} (${altDensity}%) pour une entrée plus rapide.`,
              pt: `O ${getZoneName(targetZoneId, 'pt')} está com alto fluxo (${density}%). Redirecionamos para o ${getZoneName(alternativeGate, 'pt')} (${altDensity}%) para uma entrada mais rápida.`,
            };
            detourNotice = detourTemplates[language] || detourTemplates.en;
            targetZoneId = alternativeGate;
            targetFacility = customVenueData.gates?.find((g) => g.id === alternativeGate) || { id: alternativeGate, name: getZoneName(alternativeGate, 'en') };
          }
        }
      } else if (density >= CROWD_MODERATE_THRESHOLD) {
        crowdLevel = 'medium';
      } else {
        crowdLevel = 'low';
      }
    }
  }

  // Step 5: Compute Step-Free Shortest Path
  const route = findShortestPath(currentLocation, targetZoneId, { stepFreeOnly, language });

  // Step 6: Check Kickoff Urgency Rule (< KICKOFF_URGENCY_MINUTES min)
  let urgencyText = null;
  if (minutesToKickoff !== null && minutesToKickoff !== undefined && minutesToKickoff < KICKOFF_URGENCY_MINUTES) {
    urgencyText = localize('kickoffUrgency', language);
  }

  // Step 7: Contextual Sustainability Tip
  const sustainabilityTip = resolvedIntent === 'transit'
    ? localize('sustainabilityTransit', language)
    : localize('sustainabilityGeneral', language);

  return {
    targetFacility,
    route,
    crowdLevel,
    accessibilityMode: activeMode,
    urgencyText,
    sustainabilityTip,
    detourNotice,
    intents,
    sources,
    language,
  };
}
