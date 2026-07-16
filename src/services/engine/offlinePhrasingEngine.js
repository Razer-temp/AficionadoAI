/**
 * Deterministic offline phrasing engine and graceful degradation fallback.
 * Formats structured `DecisionResult` facts into localized, scannable natural language markdown
 * across English (en), Spanish (es), French (fr), and Portuguese (pt).
 *
 * Ensures the application runs completely offline and never crashes or throws when
 * `VITE_GEMINI_API_KEY` is unset or when API rate-limits/timeouts occur during automated evaluation.
 *
 * @module offlinePhrasingEngine
 */

import { getZoneName } from './routingService.js';
import { CROWD_REROUTE_THRESHOLD, CROWD_MODERATE_THRESHOLD } from '../../utils/constants.js';

/**
 * Localized phrasing templates for offline fan responses.
 * Using lookup dictionaries eliminates repeated if/else language chains
 * and improves maintainability when adding new languages.
 * @type {Record<string, Record<string, string>>}
 */
const PHRASING = {
  urgencyHeader: {
    en: '🚨 **URGENT: KICKOFF IMMINENT**',
    es: '🚨 **URGENTE: INICIO DEL PARTIDO INMINENTE**',
    fr: "🚨 **URGENT : COUP D'ENVOI IMMINENT**",
    pt: '🚨 **URGENTE: INÍCIO DO JOGO IMINENTE**',
  },
  detourHeader: {
    en: '⚠️ **LIVE CROWD AVOIDANCE DETOUR:**',
    es: '⚠️ **DESVÍO POR AGLOMERACIÓN EN TIEMPO REAL:**',
    fr: '⚠️ **DÉVIATION ANTI-FOULE EN TEMPS RÉEL :**',
    pt: '⚠️ **DESVIO DE MULTIDÃO EM TEMPO REAL:**',
  },
  destinationHeading: {
    en: '### 📍 Recommended Destination:',
    es: '### 📍 Destino Recomendado:',
    fr: '### 📍 Destination Recommandée :',
    pt: '### 📍 Destino Recomendado:',
  },
  locationLabel: { en: 'Location', es: 'Ubicación', fr: 'Emplacement', pt: 'Localização' },
  crowdLabel: {
    en: 'Live Crowd Status',
    es: 'Nivel de Afluencia Actual',
    fr: 'Niveau de Foule Actuel',
    pt: 'Nível de Multidão Atual',
  },
  detailLabel: { en: 'Facility Details', es: 'Detalle del Lugar', fr: 'Détails', pt: 'Detalhes' },
  navigationHeading: {
    en: '#### 🗺️ Turn-by-Turn Navigation',
    es: '#### 🗺️ Guía Paso a Paso',
    fr: '#### 🗺️ Itinéraire Étape par Étape',
    pt: '#### 🗺️ Guia Passo a Passo',
  },
  distanceLabel: { en: 'Approx. Distance', es: 'Distancia', fr: 'Distance', pt: 'Distância' },
  accessibilityNote: {
    en: '👁️ *Accessibility mode active: Descriptive auditory wayfinding and high-contrast visual markers enabled.*',
    es: '👁️ *Modo de accesibilidad activo: Guía auditiva descriptiva y referencias visuales de alto contraste habilitadas.*',
    fr: "👁️ *Mode d'accessibilité actif : Guidage auditif descriptif et repères visuels à haut contraste activés.*",
    pt: '👁️ *Modo de acessibilidade ativo: Orientação auditiva descritiva e marcadores visuais de alto contraste ativados.*',
  },
  sustainabilityLabel: {
    en: '🌱 **Sustainability Tip:**',
    es: '🌱 **Consejo de Sostenibilidad:**',
    fr: '🌱 **Conseil Éco-Responsable :**',
    pt: '🌱 **Dica de Sustentabilidade:**',
  },
  defaultGreeting: {
    en: 'Hello! I am your AI concierge for FIFA World Cup 2026 at MetLife Stadium. I can assist you with step-free ADA wayfinding, NJ TRANSIT schedules, halal/kosher dining, and real-time crowd avoidance. How can I guide you today?',
    es: '¡Hola! Soy tu asistente de IA para el Mundial FIFA 2026 en el MetLife Stadium. Puedo ayudarte con navegación sin barreras, transporte en tren NJ TRANSIT, opciones de comida halal/kosher y datos de afluencia en tiempo real. ¿En qué te puedo orientar?',
    fr: "Bonjour ! Je suis votre assistant IA pour la Coupe du Monde FIFA 2026 au MetLife Stadium. Je peux vous guider vers les itinéraires accessibles, les trains NJ TRANSIT, les options de restauration et l'état des foules en direct. Comment puis-je vous aider ?",
    pt: 'Olá! Sou seu assistente de IA para a Copa do Mundo FIFA 2026 no MetLife Stadium. Posso ajudá-lo com rotas acessíveis, trens NJ TRANSIT, opções de alimentação e densidade de multidão ao vivo. Como posso ajudar?',
  },
  crowdHigh: {
    en: '🔴 **Heavy Surge / Bottleneck**',
    es: '🔴 **Alta Afluencia / Sobrecarga**',
    fr: '🔴 **Forte Affluence / Saturation**',
    pt: '🔴 **Alta Multidão / Congestionamento**',
  },
  crowdMedium: {
    en: '🟡 **Moderate Flow**',
    es: '🟡 **Afluencia Moderada**',
    fr: '🟡 **Affluence Modérée**',
    pt: '🟡 **Multidão Moderada**',
  },
  crowdLow: {
    en: '🟢 **Low Flow / No Lines**',
    es: '🟢 **Fluido / Sin Filas**',
    fr: '🟢 **Fluide / Faible Affluence**',
    pt: '🟢 **Fluxo Livre / Sem Filas**',
  },
};

/**
 * Returns a localized phrasing template string.
 * Falls back to English if the requested language is unavailable.
 * @param {string} key - Template key from PHRASING
 * @param {string} [language='en'] - Language code (en, es, fr, pt)
 * @returns {string}
 */
function phrase(key, language = 'en') {
  const entry = PHRASING[key];
  if (!entry) return '';
  return entry[language] || entry.en || '';
}

/**
 * Phrases a fan assistance decision into a localized markdown response when offline or fallback.
 *
 * @param {object} decisionResult - Resolved deterministic decision facts from `contextEngine`
 * @param {string} [question=''] - Optional raw fan question text
 * @param {string} [language='en'] - Target language code (en, es, fr, pt)
 * @returns {{ response: string, language: string, intents: string[], sources: string[], cached: boolean, offline: boolean }}
 */
export function phraseFanResponse(decisionResult, _question = '', language = 'en') {
  const {
    targetFacility = null,
    route = null,
    crowdLevel = 'low',
    accessibilityMode = 'standard',
    urgencyText = null,
    sustainabilityTip = null,
    intents = [],
    sources = ['venue-knowledge.json (deterministic rules engine)'],
    detourNotice = null,
  } = decisionResult || {};

  const lines = [];

  // Urgency header if kickoff is imminent
  if (urgencyText) {
    lines.push(`${phrase('urgencyHeader', language)} — ${urgencyText}`);
    lines.push('');
  }

  // Detour warning if crowd rerouting occurred
  if (detourNotice) {
    lines.push(`${phrase('detourHeader', language)} ${detourNotice}`);
    lines.push('');
  }

  // Main Facility Summary
  if (targetFacility) {
    const facilityName =
      targetFacility.names?.[language] || targetFacility.names?.en || targetFacility.name || targetFacility.id;
    const facilityNotes = targetFacility.notes || targetFacility.description || '';

    lines.push(`${phrase('destinationHeading', language)} **${facilityName}**`);
    if (targetFacility.zone) {
      lines.push(`- **${phrase('locationLabel', language)}:** ${getZoneName(targetFacility.zone, language)}`);
    }
    lines.push(`- **${phrase('crowdLabel', language)}:** ${formatCrowdBadge(crowdLevel, language)}`);
    if (facilityNotes) {
      lines.push(`- **${phrase('detailLabel', language)}:** ${facilityNotes}`);
    }
    lines.push('');
  }

  // Turn-by-turn routing instructions
  if (route && route.found && route.instructions.length > 0) {
    const stepFreeBadge = route.stepFree ? '♿ **100% ADA Step-Free Verified Route**' : '🚶 **Standard Walkway Route**';
    lines.push(`${phrase('navigationHeading', language)} (${stepFreeBadge} — ${phrase('distanceLabel', language)}: ~${route.distanceMeters}m)`);

    route.instructions.forEach((step) => {
      lines.push(`${step.order}. ${step.text}`);
    });
    lines.push('');
  }

  // Accessibility screen reader mode note
  if (accessibilityMode === 'screen_reader' || accessibilityMode === 'captioned') {
    lines.push(phrase('accessibilityNote', language));
    lines.push('');
  }

  // Sustainability tip
  if (sustainabilityTip) {
    lines.push(`${phrase('sustainabilityLabel', language)} ${sustainabilityTip}`);
  }

  // If general FAQ/question matched without exact facility target
  if (lines.length === 0) {
    lines.push(phrase('defaultGreeting', language));
  }

  return {
    response: lines.join('\n').trim(),
    language,
    intents,
    sources,
    cached: false,
    offline: true,
  };
}

/**
 * Formats crowd level into a localized status badge using the PHRASING dictionary.
 * @param {string} crowdLevel - Crowd density level (low, medium, high, critical)
 * @param {string} [language='en'] - Language code
 * @returns {string} Localized crowd badge with emoji indicator
 */
function formatCrowdBadge(crowdLevel, language = 'en') {
  const level = (crowdLevel || 'low').toLowerCase();
  if (level === 'high' || level === 'critical') return phrase('crowdHigh', language);
  if (level === 'medium' || level === 'moderate') return phrase('crowdMedium', language);
  return phrase('crowdLow', language);
}

/**
 * Generates an offline operational action plan briefing for `/ops` when API key is unconfigured.
 * @param {object} crowdSnapshot - Live density snapshot across stadium zones
 * @param {Array<object>} [queryLogs=[]] - Recent fan query logs
 * @returns {{ briefing: string, generatedAt: string, offline: boolean }}
 */
export function generateOfflineBriefing(crowdSnapshot, queryLogs = []) {
  const now = new Date().toISOString();
  const zones = crowdSnapshot?.zones || [];

  const highZones = zones.filter((z) => z.density >= CROWD_REROUTE_THRESHOLD);
  const modZones = zones.filter((z) => z.density >= CROWD_MODERATE_THRESHOLD && z.density < CROWD_REROUTE_THRESHOLD);

  const totalQueries = queryLogs.length;
  const navQueries = queryLogs.filter((l) => l.intent?.includes('navigation') || l.intent?.includes('wayfinding')).length;

  const statusText =
    highZones.length > 0
      ? '[STATUS: ACTION REQUIRED / TACTICAL DISPATCH]\nSTATUS LINE: YELLOW ALERT — SURGE MITIGATION REQUIRED'
      : '[STATUS: NORMAL OPERATIONS]\nSTATUS LINE: GREEN — NORMAL STADIUM OPERATIONAL FLOW';

  const lines = [
    statusText,
    '',
    '### SITUATION SUMMARY',
    `- **Active High-Density Sectors:** ${highZones.length > 0 ? highZones.map((z) => `${z.name} (${z.density}%)`).join(', ') : 'None (All zones within capacity thresholds)'}`,
    `- **Moderate Flow Sectors:** ${modZones.length > 0 ? modZones.map((z) => `${z.name} (${z.density}%)`).join(', ') : 'All concourses operating normally'}`,
    `- **Fan Query Telemetry:** ${totalQueries} queries logged in current window (${navQueries} navigation-related).`,
    '',
    '### RECOMMENDED ACTIONS (DETERMINISTIC RULES ENGINE)',
  ];

  if (highZones.length > 0) {
    highZones.forEach((z, idx) => {
      lines.push(
        `${idx + 1}. **Reroute Entry & Concourse Flow at ${z.name}:** Deploy bilingual volunteer wayfinders to redirect fans to adjacent lower-density gates or concourse stairwells immediately.`
      );
    });
    lines.push(
      `${highZones.length + 1}. **Security Line Speed Optimization:** Open all express turnstile lanes and dispatch mobile security screening units to high-surge zones.`
    );
  } else {
    lines.push(`1. **Maintain Standard Volunteer Postings:** Keep ADA escort volunteers stationed at Gates A, B, C, and D.`);
    lines.push(`2. **Monitor NJ TRANSIT Arrival Waves:** Prepare concourse greeters 45 minutes prior to kickoff for express train arrival surges.`);
    lines.push(`3. **Sustainability Check:** Verify water refill station pressure and recycling bin clearance across all 100-level concourses.`);
  }

  return {
    briefing: lines.join('\n').trim(),
    generatedAt: now,
    offline: true,
  };
}
