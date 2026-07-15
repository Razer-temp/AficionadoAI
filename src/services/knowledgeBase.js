/**
 * Knowledge base retrieval service.
 * Performs structured keyword/intent matching against venue-knowledge.json
 * to ground Gemini responses in factual venue data.
 * 
 * This is the "RAG" layer — every fan query about the venue is first
 * matched against this knowledge base, and relevant context is injected
 * into the Gemini prompt. If no match is found, the assistant says so
 * honestly rather than hallucinating.
 * @module knowledgeBase
 */

import venueData from '../../venue-knowledge.json';

/**
 * Intent categories that map to knowledge base sections.
 * @enum {string}
 */
export const INTENT_CATEGORIES = {
  NAVIGATION: 'navigation',
  TRANSPORTATION: 'transportation',
  ACCESSIBILITY: 'accessibility',
  FOOD: 'food',
  POLICY: 'policy',
  MEDICAL: 'medical',
  WEATHER: 'weather',
  SUSTAINABILITY: 'sustainability',
  CROWD: 'crowd',
  GENERAL: 'general',
};

/**
 * Keyword patterns mapped to intent categories for classification.
 * Uses arrays of keywords that trigger each category.
 */
const INTENT_PATTERNS = {
  [INTENT_CATEGORIES.NAVIGATION]: [
    'gate', 'entrance', 'section', 'seat', 'level', 'floor', 'find', 'where',
    'how do i get', 'directions', 'navigate', 'way to', 'located', 'nearest',
    'restroom', 'bathroom', 'elevator', 'stairs', 'concourse',
    'puerta', 'entrada', 'sección', 'dónde', 'cómo llego',
    'porte', 'entrée', 'où', 'comment',
    'portão', 'entrada', 'seção', 'onde', 'como chego',
  ],
  [INTENT_CATEGORIES.TRANSPORTATION]: [
    'transit', 'train', 'bus', 'subway', 'metro', 'shuttle', 'parking',
    'rideshare', 'uber', 'lyft', 'taxi', 'drive', 'car', 'transport',
    'nj transit', 'path', 'penn station', 'how to get here',
    'transporte', 'tren', 'autobús', 'estacionamiento',
    'transport', 'gare',
    'transporte', 'trem', 'ônibus',
  ],
  [INTENT_CATEGORIES.ACCESSIBILITY]: [
    'wheelchair', 'accessible', 'disability', 'ada', 'mobility',
    'hearing', 'visual', 'impair', 'assist', 'elevator', 'ramp',
    'companion seat', 'accessible parking', 'drop off', 'escort',
    'silla de ruedas', 'accesible', 'discapacidad',
    'fauteuil roulant', 'accessible',
    'cadeira de rodas', 'acessível',
  ],
  [INTENT_CATEGORIES.FOOD]: [
    'food', 'eat', 'restaurant', 'concession', 'drink', 'beer', 'water',
    'halal', 'kosher', 'vegetarian', 'vegan', 'snack', 'hungry',
    'comida', 'comer', 'bebida',
    'nourriture', 'manger', 'boire',
    'comida', 'comer', 'bebida',
  ],
  [INTENT_CATEGORIES.POLICY]: [
    'bag', 'bring', 'allowed', 'prohibited', 'ban', 'policy', 'rule',
    'water bottle', 'camera', 'umbrella', 'reentry', 're-entry',
    'gate open', 'gates open', 'what time', 'when', 'hours',
    'clear bag', 'backpack', 'flag', 'banner', 'stroller',
    'bolsa', 'permitido', 'prohibido', 'regla', 'política',
    'sac', 'permis', 'interdit', 'règle',
    'bolsa', 'permitido', 'proibido', 'regra',
  ],
  [INTENT_CATEGORIES.MEDICAL]: [
    'medical', 'first aid', 'doctor', 'nurse', 'emt', 'emergency',
    'hurt', 'injured', 'sick', 'health', 'nursing', 'baby',
    'médico', 'primeros auxilios', 'emergencia',
    'médical', 'premiers soins', 'urgence',
    'médico', 'primeiros socorros', 'emergência',
  ],
  [INTENT_CATEGORIES.WEATHER]: [
    'weather', 'rain', 'sun', 'hot', 'cold', 'temperature', 'umbrella',
    'poncho', 'sunscreen', 'shade', 'roof', 'covered',
    'clima', 'lluvia', 'sol', 'calor',
    'météo', 'pluie', 'soleil', 'chaud',
    'clima', 'chuva', 'sol', 'calor',
  ],
  [INTENT_CATEGORIES.SUSTAINABILITY]: [
    'sustainability', 'sustainable', 'green', 'recycle', 'recycling',
    'carbon', 'environment', 'eco',
    'sostenible', 'reciclar',
    'durable', 'recycler',
    'sustentável', 'reciclar',
  ],
  [INTENT_CATEGORIES.CROWD]: [
    'crowd', 'busy', 'packed', 'crowded', 'avoid', 'wait', 'line',
    'queue', 'density', 'which gate', 'less busy', 'fastest',
    'multitud', 'lleno', 'evitar', 'cola',
    'foule', 'bondé', 'éviter', 'file',
    'multidão', 'lotado', 'evitar', 'fila',
  ],
};

/**
 * Classifies a user query into one or more intent categories.
 * @param {string} query - User's message text
 * @returns {string[]} Array of matching intent categories, ordered by relevance
 */
export function classifyIntent(query) {
  const lowerQuery = query.toLowerCase();
  const matches = [];

  for (const [category, keywords] of Object.entries(INTENT_PATTERNS)) {
    const matchCount = keywords.filter((kw) => lowerQuery.includes(kw)).length;
    if (matchCount > 0) {
      matches.push({ category, score: matchCount });
    }
  }

  // Sort by match count (most relevant first)
  matches.sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    return [INTENT_CATEGORIES.GENERAL];
  }

  return matches.map((m) => m.category);
}

/**
 * Retrieves relevant context from the knowledge base for given intents.
 * Returns structured venue data that will be injected into the Gemini prompt.
 * @param {string[]} intents - Array of intent categories
 * @param {string} query - Original user query (for sub-filtering)
 * @returns {{ context: string, sources: string[], intentCategories: string[] }}
 */
export function retrieveContext(intents, query) {
  const contextParts = [];
  const sources = [];
  const lowerQuery = query.toLowerCase();

  for (const intent of intents.slice(0, 3)) {
    switch (intent) {
      case INTENT_CATEGORIES.NAVIGATION: {
        // Find relevant gates
        const gates = venueData.gates.filter((g) => {
          const gateTerms = [g.id, g.name, g.direction, ...g.sections].join(' ').toLowerCase();
          return lowerQuery.split(/\s+/).some((word) => gateTerms.includes(word)) ||
            lowerQuery.includes('gate') || lowerQuery.includes('entrance');
        });
        if (gates.length > 0) {
          contextParts.push('GATE INFORMATION:\n' + JSON.stringify(gates, null, 2));
          sources.push('venue-gates');
        }

        // Levels
        contextParts.push('STADIUM LEVELS:\n' + JSON.stringify(venueData.levels, null, 2));
        sources.push('venue-levels');

        // Restrooms if mentioned
        if (lowerQuery.includes('restroom') || lowerQuery.includes('bathroom') || lowerQuery.includes('baño') || lowerQuery.includes('toilette')) {
          contextParts.push('RESTROOM INFORMATION:\n' + JSON.stringify(venueData.restrooms, null, 2));
          sources.push('venue-restrooms');
        }

        // Guest services
        if (lowerQuery.includes('service') || lowerQuery.includes('help') || lowerQuery.includes('info')) {
          contextParts.push('GUEST SERVICES LOCATIONS:\n' + JSON.stringify(venueData.guestServices, null, 2));
          sources.push('venue-guest-services');
        }
        break;
      }

      case INTENT_CATEGORIES.TRANSPORTATION: {
        contextParts.push('TRANSPORTATION OPTIONS:\n' + JSON.stringify(venueData.transit, null, 2));
        sources.push('venue-transit');
        break;
      }

      case INTENT_CATEGORIES.ACCESSIBILITY: {
        contextParts.push('ACCESSIBLE ROUTES:\n' + JSON.stringify(venueData.accessibleRoutes, null, 2));
        contextParts.push('ACCESSIBILITY SERVICES:\n' + JSON.stringify(venueData.accessibility, null, 2));
        sources.push('venue-accessible-routes', 'venue-accessibility');

        // Include relevant gates with accessible features
        const accessibleGates = venueData.gates.filter((g) => g.accessible);
        contextParts.push('ACCESSIBLE GATE FEATURES:\n' + JSON.stringify(accessibleGates, null, 2));
        sources.push('venue-gates-accessible');
        break;
      }

      case INTENT_CATEGORIES.FOOD: {
        contextParts.push('FOOD & BEVERAGE OPTIONS:\n' + JSON.stringify(venueData.food, null, 2));
        sources.push('venue-food');
        break;
      }

      case INTENT_CATEGORIES.POLICY: {
        contextParts.push('STADIUM POLICIES:\n' + JSON.stringify(venueData.policies, null, 2));
        sources.push('venue-policies');
        break;
      }

      case INTENT_CATEGORIES.MEDICAL: {
        contextParts.push('MEDICAL FACILITIES:\n' + JSON.stringify(venueData.medical, null, 2));
        sources.push('venue-medical');

        // Include nursing rooms if relevant
        if (lowerQuery.includes('nursing') || lowerQuery.includes('baby') || lowerQuery.includes('bebé') || lowerQuery.includes('bébé')) {
          contextParts.push('NURSING FACILITIES:\n' + JSON.stringify(venueData.restrooms.nursing, null, 2));
          sources.push('venue-nursing');
        }
        break;
      }

      case INTENT_CATEGORIES.WEATHER: {
        contextParts.push('WEATHER & VENUE INFO:\n' + JSON.stringify(venueData.weather, null, 2));
        sources.push('venue-weather');
        break;
      }

      case INTENT_CATEGORIES.SUSTAINABILITY: {
        contextParts.push('SUSTAINABILITY INFO:\n' + JSON.stringify(venueData.sustainability, null, 2));
        sources.push('venue-sustainability');
        break;
      }

      case INTENT_CATEGORIES.CROWD: {
        // For crowd queries, provide gate info so the AI can reference locations
        contextParts.push('GATE LOCATIONS (for crowd guidance):\n' + JSON.stringify(
          venueData.gates.map((g) => ({ id: g.id, name: g.name, direction: g.direction, sections: g.sections })),
          null, 2,
        ));
        sources.push('venue-gates-crowd');
        break;
      }

      case INTENT_CATEGORIES.GENERAL:
      default: {
        // Provide venue overview for general queries
        contextParts.push('VENUE OVERVIEW:\n' + JSON.stringify(venueData.venue, null, 2));
        contextParts.push('STADIUM POLICIES:\n' + JSON.stringify(venueData.policies, null, 2));
        sources.push('venue-overview', 'venue-policies');
        break;
      }
    }
  }

  // De-duplicate sources
  const uniqueSources = [...new Set(sources)];

  return {
    context: contextParts.join('\n\n'),
    sources: uniqueSources,
    intentCategories: intents,
  };
}

/**
 * Gets the full venue name for display purposes.
 * @returns {string} The venue name
 */
export function getVenueName() {
  return `${venueData.venue.name} (${venueData.venue.officialName})`;
}

/**
 * Gets all gate information for the ops dashboard.
 * @returns {Array} Array of gate objects
 */
export function getAllGates() {
  return venueData.gates;
}
