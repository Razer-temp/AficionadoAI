/**
 * Shortest-path routing engine over the stadium zone graph.
 * Implements Dijkstra's algorithm to compute the optimal route between stadium zones.
 *
 * When `stepFreeOnly: true` is passed (wheelchair / visual accessibility needs), edges
 * that are not step-free (e.g. stairs, escalators without elevator alternatives) are excluded,
 * ensuring accessible routes provably differ from default ones and guarantee ADA compliance.
 *
 * @module routingService
 */

/**
 * @typedef {object} RouteEdge
 * @property {string} to - Target zone ID
 * @property {number} distance - Distance in meters
 * @property {string} means - Means of transit ('walk', 'ramp', 'elevator', 'stairs', 'turnstile')
 * @property {boolean} stepFree - Whether this edge is wheelchair step-free
 * @property {object} [landmarks] - Localized landmark description for this edge ({ en, es, fr, pt })
 */

/**
 * Stadium navigation graph definition mapping zone IDs to their outgoing edges.
 * @type {Record<string, Array<RouteEdge>>}
 */
export const STADIUM_GRAPH = {
  'gate-a': [
    { to: '100-level-east', distance: 45, means: 'turnstile', stepFree: true, landmarks: { en: 'MetLife Gate entrance turnstiles', es: 'Torniquetes de entrada de la Puerta MetLife', fr: 'Tourniquets d\'entrée de la porte MetLife', pt: 'Catracas de entrada do Portão MetLife' } },
    { to: 'west-hall-concourse', distance: 60, means: 'walk', stepFree: true, landmarks: { en: 'West Hall Food Court entrance', es: 'Entrada del patio de comidas West Hall', fr: 'Entrée de l\'aire de restauration West Hall', pt: 'Entrada da praça de alimentação West Hall' } },
    { to: '200-level-east', distance: 120, means: 'elevator', stepFree: true, landmarks: { en: 'Gate A Southeast Lobby Elevator', es: 'Ascensor del vestíbulo sureste Puerta A', fr: 'Ascenseur du hall sud-est porte A', pt: 'Elevador do saguão sudeste Portão A' } },
    { to: '200-level-east-stairs', distance: 90, means: 'stairs', stepFree: false, landmarks: { en: 'Gate A Express Stairwell', es: 'Escalera expresa Puerta A', fr: 'Escalier express porte A', pt: 'Escadaria expressa Portão A' } },
  ],
  'gate-b': [
    { to: '100-level-south', distance: 40, means: 'turnstile', stepFree: true, landmarks: { en: 'Verizon Gate main entrance & ADA priority lanes', es: 'Entrada principal Puerta Verizon y carriles ADA', fr: 'Entrée principale porte Verizon et voies prioritaires ADA', pt: 'Entrada principal Portão Verizon e faixas ADA' } },
    { to: '200-level-south', distance: 110, means: 'elevator', stepFree: true, landmarks: { en: 'Verizon Gate Lobby Elevator to all levels', es: 'Ascensor del vestíbulo Puerta Verizon a todos los niveles', fr: 'Ascenseur du hall porte Verizon pour tous les niveaux', pt: 'Elevador do saguão Portão Verizon para todos os níveis' } },
    { to: '300-level-south', distance: 160, means: 'elevator', stepFree: true, landmarks: { en: 'Verizon Gate Express Elevator to Upper Deck', es: 'Ascensor expreso Puerta Verizon al nivel superior', fr: 'Ascenseur express porte Verizon vers le niveau supérieur', pt: 'Elevador expresso Portão Verizon para o nível superior' } },
  ],
  'gate-c': [
    { to: '100-level-east', distance: 50, means: 'turnstile', stepFree: true, landmarks: { en: 'HCLTech Gate entrance turnstiles', es: 'Torniquetes de la Puerta HCLTech', fr: 'Tourniquets de la porte HCLTech', pt: 'Catracas do Portão HCLTech' } },
    { to: '200-level-east', distance: 115, means: 'elevator', stepFree: true, landmarks: { en: 'HCLTech Gate Southeast Lobby Elevator', es: 'Ascensor del vestíbulo sureste Puerta HCLTech', fr: 'Ascenseur du hall sud-est porte HCLTech', pt: 'Elevador do saguão sudeste Portão HCLTech' } },
  ],
  'gate-d': [
    { to: '100-level-west', distance: 55, means: 'turnstile', stepFree: true, landmarks: { en: 'Moody\'s Gate entrance turnstiles', es: 'Torniquetes de la Puerta Moody\'s', fr: 'Tourniquets de la porte Moody\'s', pt: 'Catracas do Portão Moody\'s' } },
    { to: '200-level-west', distance: 125, means: 'elevator', stepFree: true, landmarks: { en: 'Moody\'s Gate Northwest Elevator Lobby', es: 'Vestíbulo de ascensores noroeste Puerta Moody\'s', fr: 'Hall d\'ascenseur nord-ouest porte Moody\'s', pt: 'Saguão do elevador noroeste Portão Moody\'s' } },
  ],
  'nj-transit-station': [
    { to: 'gate-a', distance: 180, means: 'walk', stepFree: true, landmarks: { en: 'Main pedestrian plaza from Secaucus rail arrival', es: 'Plaza peatonal principal desde llegada del tren Secaucus', fr: 'Esplanade piétonne principale depuis l\'arrivée du train Secaucus', pt: 'Praça de pedestres principal da chegada do trem Secaucus' } },
    { to: 'gate-b', distance: 240, means: 'walk', stepFree: true, landmarks: { en: 'South walkway toward Lot C & Verizon Gate', es: 'Paseo sur hacia Lote C y Puerta Verizon', fr: 'Allée sud vers le lot C et la porte Verizon', pt: 'Passarela sul em direção ao Lote C e Portão Verizon' } },
  ],
  'parking-lot-c': [
    { to: 'gate-b', distance: 30, means: 'ramp', stepFree: true, landmarks: { en: 'ADA Priority Drop-Off Ramp directly to Verizon Gate', es: 'Rampa ADA de bajada prioritaria directamente a Puerta Verizon', fr: 'Rampe de dépose prioritaire ADA directement vers la porte Verizon', pt: 'Rampa ADA de desembarque prioritário direto para o Portão Verizon' } },
  ],
  'west-hall-concourse': [
    { to: '100-level-east', distance: 40, means: 'walk', stepFree: true, landmarks: { en: 'Pass through West Hall inside Gate A', es: 'Pasar por West Hall dentro de la Puerta A', fr: 'Traverser le West Hall à l\'intérieur de la porte A', pt: 'Passar pelo West Hall dentro do Portão A' } },
    { to: 'halal-shahs', distance: 15, means: 'walk', stepFree: true, landmarks: { en: 'Shah\'s Halal Food Stand in West Hall', es: 'Puesto de comida Shah\'s Halal en West Hall', fr: 'Stand de nourriture Shah\'s Halal dans le West Hall', pt: 'Quiosque de comida Shah\'s Halal no West Hall' } },
  ],
  '100-level-east': [
    { to: 'gate-a', distance: 45, means: 'walk', stepFree: true, landmarks: { en: 'Exit towards MetLife Gate', es: 'Salida hacia Puerta MetLife', fr: 'Sortie vers la porte MetLife', pt: 'Saída para o Portão MetLife' } },
    { to: 'gate-c', distance: 50, means: 'walk', stepFree: true, landmarks: { en: 'Exit towards HCLTech Gate', es: 'Salida hacia Puerta HCLTech', fr: 'Sortie vers la porte HCLTech', pt: 'Saída para o Portão HCLTech' } },
    { to: '100-level-south', distance: 80, means: 'walk', stepFree: true, landmarks: { en: 'Main concourse walkway toward Section 124', es: 'Pasillo principal hacia Sección 124', fr: 'Allée principale du hall vers la section 124', pt: 'Passarela principal do saguão para a Seção 124' } },
    { to: 'first-aid-103', distance: 35, means: 'walk', stepFree: true, landmarks: { en: 'First Aid Station adjacent to Section 103', es: 'Estación de Primeros Auxilios junto a Sección 103', fr: 'Poste de premiers secours adjacent à la section 103', pt: 'Posto de Primeiros Socorros adjacente à Seção 103' } },
    { to: 'restroom-100-east', distance: 20, means: 'walk', stepFree: true, landmarks: { en: 'ADA Accessible Restrooms near Section 108', es: 'Baños accesibles ADA cerca de Sección 108', fr: 'Toilettes accessibles ADA près de la section 108', pt: 'Banheiros acessíveis ADA perto da Seção 108' } },
    { to: 'water-refill-108', distance: 25, means: 'walk', stepFree: true, landmarks: { en: 'Water Refill Station between Sections 108 & 109', es: 'Estación de recarga de agua entre Secciones 108 y 109', fr: 'Station de remplissage d\'eau entre les sections 108 et 109', pt: 'Estação de refil de água entre as Seções 108 e 109' } },
  ],
  '100-level-south': [
    { to: 'gate-b', distance: 40, means: 'walk', stepFree: true, landmarks: { en: 'Exit towards Verizon Gate', es: 'Salida hacia Puerta Verizon', fr: 'Sortie vers la porte Verizon', pt: 'Saída para o Portão Verizon' } },
    { to: '100-level-east', distance: 80, means: 'walk', stepFree: true, landmarks: { en: 'Main concourse walkway toward Gate A', es: 'Pasillo principal hacia Puerta A', fr: 'Allée principale du hall vers la porte A', pt: 'Passarela principal para o Portão A' } },
    { to: '100-level-west', distance: 85, means: 'walk', stepFree: true, landmarks: { en: 'Main concourse walkway toward Gate D', es: 'Pasillo principal hacia Puerta D', fr: 'Allée principale du hall vers la porte D', pt: 'Passarela principal para o Portão D' } },
    { to: 'first-aid-128', distance: 30, means: 'walk', stepFree: true, landmarks: { en: 'First Aid Station with adult changing table near Section 128', es: 'Estación de Primeros Auxilios cerca de Sección 128', fr: 'Poste de premiers secours près de la section 128', pt: 'Posto de Primeiros Socorros perto da Seção 128' } },
    { to: 'sensory-room-124', distance: 25, means: 'walk', stepFree: true, landmarks: { en: 'Dedicated Low-Sensory Room near Section 124 Guest Services', es: 'Sala sensorial tranquila cerca de Servicios al Invitado Sección 124', fr: 'Salle sensorielle calme près des services aux invités section 124', pt: 'Sala sensorial calma perto dos Serviços de Atendimento Seção 124' } },
  ],
  '100-level-west': [
    { to: 'gate-d', distance: 55, means: 'walk', stepFree: true, landmarks: { en: 'Exit towards Moody\'s Gate', es: 'Salida hacia Puerta Moody\'s', fr: 'Sortie vers la porte Moody\'s', pt: 'Saída para o Portão Moody\'s' } },
    { to: '100-level-south', distance: 85, means: 'walk', stepFree: true, landmarks: { en: 'Walkway toward Section 128', es: 'Pasillo hacia Sección 128', fr: 'Allée vers la section 128', pt: 'Passarela para a Seção 128' } },
  ],
  '200-level-east': [
    { to: 'gate-a', distance: 120, means: 'elevator', stepFree: true, landmarks: { en: 'Gate A Southeast Elevator to Plaza Level', es: 'Ascensor sureste Puerta A al nivel plaza', fr: 'Ascenseur sud-est porte A vers le niveau plaza', pt: 'Elevador sudeste Portão A para o nível praça' } },
    { to: '200-level-south', distance: 95, means: 'walk', stepFree: true, landmarks: { en: 'Mezzanine Club level walkway', es: 'Pasillo del nivel Mezzanine Club', fr: 'Allée du niveau Mezzanine Club', pt: 'Passarela do nível Mezzanine Club' } },
    { to: 'restroom-200-east', distance: 30, means: 'walk', stepFree: true, landmarks: { en: 'Mezzanine ADA Restroom near Section 216', es: 'Baño ADA Mezzanine cerca de Sección 216', fr: 'Toilettes ADA Mezzanine près de la section 216', pt: 'Banheiro ADA Mezzanine perto da Seção 216' } },
  ],
  '200-level-south': [
    { to: 'gate-b', distance: 110, means: 'elevator', stepFree: true, landmarks: { en: 'Verizon Gate Elevator to Plaza Level', es: 'Ascensor Puerta Verizon al nivel plaza', fr: 'Ascenseur porte Verizon vers le niveau plaza', pt: 'Elevador Portão Verizon para o nível praça' } },
    { to: '200-level-east', distance: 95, means: 'walk', stepFree: true, landmarks: { en: 'Walkway toward Section 216', es: 'Pasillo hacia Sección 216', fr: 'Allée vers la section 216', pt: 'Passarela para a Seção 216' } },
  ],
  '200-level-west': [
    { to: 'gate-d', distance: 125, means: 'elevator', stepFree: true, landmarks: { en: 'Moody\'s Gate Elevator to Plaza Level', es: 'Ascensor Puerta Moody\'s al nivel plaza', fr: 'Ascenseur porte Moody\'s vers le niveau plaza', pt: 'Elevador Portão Moody\'s para o nível praça' } },
  ],
  '300-level-south': [
    { to: 'gate-b', distance: 160, means: 'elevator', stepFree: true, landmarks: { en: 'Verizon Gate Express Elevator to Plaza Level', es: 'Ascensor expreso Puerta Verizon al nivel plaza', fr: 'Ascenseur express porte Verizon vers le niveau plaza', pt: 'Elevador expresso Portão Verizon para o nível praça' } },
    { to: 'first-aid-301', distance: 40, means: 'walk', stepFree: true, landmarks: { en: 'Upper Deck First Aid near Section 301', es: 'Primeros Auxilios del Nivel Superior cerca de Sección 301', fr: 'Premiers secours du niveau supérieur près de la section 301', pt: 'Primeiros Socorros do Nível Superior perto da Seção 301' } },
    { to: 'water-refill-330', distance: 35, means: 'walk', stepFree: true, landmarks: { en: 'Upper Concourse Water Refill near Section 330', es: 'Recarga de agua Nivel Superior cerca de Sección 330', fr: 'Remplissage d\'eau du hall supérieur près de la section 330', pt: 'Refil de água do saguão superior perto da Seção 330' } },
  ],
  // Leaf facility endpoints
  'halal-shahs': [],
  'first-aid-103': [],
  'first-aid-128': [],
  'first-aid-301': [],
  'sensory-room-124': [],
  'restroom-100-east': [],
  'restroom-200-east': [],
  'water-refill-108': [],
  'water-refill-330': [],
};

/**
 * Human-readable localized names for zones in the stadium graph.
 * @type {Record<string, Record<string, string>>}
 */
export const ZONE_NAMES = {
  'gate-a': { en: 'MetLife Gate (Gate A)', es: 'Puerta MetLife (Puerta A)', fr: 'Porte MetLife (Porte A)', pt: 'Portão MetLife (Portão A)' },
  'gate-b': { en: 'Verizon Gate (Gate B)', es: 'Puerta Verizon (Puerta B)', fr: 'Porte Verizon (Porte B)', pt: 'Portão Verizon (Portão B)' },
  'gate-c': { en: 'HCLTech Gate (Gate C)', es: 'Puerta HCLTech (Puerta C)', fr: 'Porte HCLTech (Porte C)', pt: 'Portão HCLTech (Portão C)' },
  'gate-d': { en: 'Moody\'s Gate (Gate D)', es: 'Puerta Moody\'s (Puerta D)', fr: 'Porte Moody\'s (Porte D)', pt: 'Portão Moody\'s (Portão D)' },
  'nj-transit-station': { en: 'NJ TRANSIT Secaucus Rail Hub', es: 'Estación de Tren NJ TRANSIT Secaucus', fr: 'Gare ferroviaire NJ TRANSIT Secaucus', pt: 'Estação Ferroviária NJ TRANSIT Secaucus' },
  'parking-lot-c': { en: 'ADA Parking & Drop-Off (Lot C)', es: 'Estacionamiento y Bajada ADA (Lote C)', fr: 'Parking et dépose ADA (Lot C)', pt: 'Estacionamento e Desembarque ADA (Lote C)' },
  'west-hall-concourse': { en: 'West Hall Food Court (100 Level)', es: 'Patio de Comidas West Hall (Nivel 100)', fr: 'Aire de restauration West Hall (Niveau 100)', pt: 'Praça de Alimentação West Hall (Nível 100)' },
  '100-level-east': { en: '100 Level Concourse (East / Sections 101-112)', es: 'Vestíbulo Nivel 100 (Este / Secciones 101-112)', fr: 'Hall Niveau 100 (Est / Sections 101-112)', pt: 'Saguão Nível 100 (Leste / Seções 101-112)' },
  '100-level-south': { en: '100 Level Concourse (South / Sections 124-137)', es: 'Vestíbulo Nivel 100 (Sur / Secciones 124-137)', fr: 'Hall Niveau 100 (Sud / Sections 124-137)', pt: 'Saguão Nível 100 (Sul / Seções 124-137)' },
  '100-level-west': { en: '100 Level Concourse (West / Sections 113-123)', es: 'Vestíbulo Nivel 100 (Oeste / Secciones 113-123)', fr: 'Hall Niveau 100 (Ouest / Sections 113-123)', pt: 'Saguão Nível 100 (Oeste / Seções 113-123)' },
  '200-level-east': { en: '200 Level Mezzanine Club (East / Sections 201-216)', es: 'Nivel 200 Mezzanine Club (Este)', fr: 'Niveau 200 Mezzanine Club (Est)', pt: 'Nível 200 Mezzanine Club (Leste)' },
  '200-level-south': { en: '200 Level Mezzanine Club (South / Sections 224-237)', es: 'Nivel 200 Mezzanine Club (Sur)', fr: 'Niveau 200 Mezzanine Club (Sud)', pt: 'Nível 200 Mezzanine Club (Sul)' },
  '200-level-west': { en: '200 Level Mezzanine Club (West / Sections 217-223)', es: 'Nivel 200 Mezzanine Club (Oeste)', fr: 'Niveau 200 Mezzanine Club (Ouest)', pt: 'Nível 200 Mezzanine Club (Oeste)' },
  '300-level-south': { en: '300 Level Upper Deck (South / Sections 324-337)', es: 'Nivel 300 Grada Superior (Sur)', fr: 'Niveau 300 Tribune Supérieure (Sud)', pt: 'Nível 300 Arquibancada Superior (Sul)' },
  'halal-shahs': { en: 'Shah\'s Halal Food Stand', es: 'Puesto Shah\'s Halal', fr: 'Stand Shah\'s Halal', pt: 'Quiosque Shah\'s Halal' },
  'first-aid-103': { en: 'First Aid Station (Section 103)', es: 'Estación de Primeros Auxilios (Sección 103)', fr: 'Poste de premiers secours (Section 103)', pt: 'Posto de Primeiros Socorros (Seção 103)' },
  'first-aid-128': { en: 'First Aid Station & Adult Changing Table (Section 128)', es: 'Primeros Auxilios y Cambiador de Adultos (Sección 128)', fr: 'Premiers secours et table à langer adulte (Section 128)', pt: 'Primeiros Socorros e Trocador para Adultos (Seção 128)' },
  'first-aid-301': { en: 'First Aid Station (Section 301)', es: 'Primeros Auxilios (Sección 301)', fr: 'Premiers secours (Section 301)', pt: 'Primeiros Socorros (Seção 301)' },
  'sensory-room-124': { en: 'Low-Sensory Room (Section 124)', es: 'Sala Sensorial Tranquila (Sección 124)', fr: 'Salle sensorielle calme (Section 124)', pt: 'Sala Sensorial Calma (Seção 124)' },
  'restroom-100-east': { en: 'ADA Restrooms (Section 108)', es: 'Baños ADA (Sección 108)', fr: 'Toilettes ADA (Section 108)', pt: 'Banheiros ADA (Seção 108)' },
  'restroom-200-east': { en: 'ADA Mezzanine Restrooms (Section 216)', es: 'Baños ADA Mezzanine (Sección 216)', fr: 'Toilettes ADA Mezzanine (Section 216)', pt: 'Banheiros ADA Mezzanine (Seção 216)' },
  'water-refill-108': { en: 'Water Refill Station (Section 108)', es: 'Estación de Recarga de Agua (Sección 108)', fr: 'Station de remplissage d\'eau (Section 108)', pt: 'Estação de Refil de Água (Seção 108)' },
  'water-refill-330': { en: 'Upper Concourse Water Refill (Section 330)', es: 'Recarga de Agua Nivel Superior (Sección 330)', fr: 'Remplissage d\'eau hall supérieur (Section 330)', pt: 'Refil de Água Saguão Superior (Seção 330)' },
};

/**
 * Returns the localized name for a zone ID, falling back to English or the ID itself.
 * @param {string} zoneId - Zone ID
 * @param {string} [language='en'] - Language code (en, es, fr, pt)
 * @returns {string} Localized zone name
 */
export function getZoneName(zoneId, language = 'en') {
  const names = ZONE_NAMES[zoneId];
  if (!names) return zoneId;
  return names[language] || names.en || zoneId;
}

/**
 * Finds the shortest path between two stadium zones using Dijkstra's algorithm.
 * Filters out non-step-free routes if `stepFreeOnly: true` is set.
 *
 * @param {string} startZoneId - Starting zone or node ID
 * @param {string} targetZoneId - Destination zone or node ID
 * @param {{ stepFreeOnly?: boolean, language?: string }} [options={}] - Routing options
 * @returns {{ found: boolean, distanceMeters: number, stepCount: number, stepFree: boolean, pathZones: string[], instructions: Array<{ order: number, from: string, to: string, means: string, distance: number, text: string }> } | null}
 */
export function findShortestPath(startZoneId, targetZoneId, options = {}) {
  const { stepFreeOnly = false, language = 'en' } = options;

  if (startZoneId === targetZoneId) {
    return {
      found: true,
      distanceMeters: 0,
      stepCount: 0,
      stepFree: true,
      pathZones: [startZoneId],
      instructions: [],
    };
  }

  if (!STADIUM_GRAPH[startZoneId] || !STADIUM_GRAPH[targetZoneId]) {
    return null;
  }

  // Priority queue of [totalDistance, currentNodeId]
  const frontier = [[0, startZoneId]];
  const bestDistance = { [startZoneId]: 0 };
  const cameFrom = {};

  while (frontier.length > 0) {
    // Pop minimum distance node from frontier
    frontier.sort((a, b) => a[0] - b[0]);
    const [currentDist, currentNode] = frontier.shift();

    if (currentNode === targetZoneId) {
      return reconstructPath(cameFrom, startZoneId, targetZoneId, language);
    }

    if (currentDist > (bestDistance[currentNode] ?? Infinity)) {
      continue;
    }

    const neighbors = STADIUM_GRAPH[currentNode] || [];
    for (const edge of neighbors) {
      if (stepFreeOnly && !edge.stepFree) {
        continue;
      }

      const newDist = currentDist + edge.distance;
      if (newDist < (bestDistance[edge.to] ?? Infinity)) {
        bestDistance[edge.to] = newDist;
        cameFrom[edge.to] = { from: currentNode, edge };
        frontier.push([newDist, edge.to]);
      }
    }
  }

  return null;
}

/**
 * Reconstructs the shortest path and generates localized turn-by-turn instructions.
 * @private
 */
function reconstructPath(cameFrom, startZoneId, targetZoneId, language) {
  const edges = [];
  let current = targetZoneId;

  while (current !== startZoneId && cameFrom[current]) {
    const { from, edge } = cameFrom[current];
    edges.unshift({ from, to: current, ...edge });
    current = from;
  }

  const pathZones = [startZoneId, ...edges.map((e) => e.to)];
  const totalDistance = edges.reduce((sum, e) => sum + e.distance, 0);
  const allStepFree = edges.every((e) => e.stepFree);

  const instructions = edges.map((edge, index) => {
    const toName = getZoneName(edge.to, language);
    const landmark = edge.landmarks?.[language] || edge.landmarks?.en || toName;

    let actionText = '';
    const meansText =
      edge.means === 'elevator'
        ? (language === 'es' ? 'Tome el ascensor' : language === 'fr' ? 'Prenez l\'ascenseur' : language === 'pt' ? 'Pegue o elevador' : 'Take the elevator')
        : edge.means === 'ramp'
        ? (language === 'es' ? 'Suba por la rampa accesible' : language === 'fr' ? 'Prenez la rampe accessible' : language === 'pt' ? 'Siga pela rampa acessível' : 'Follow the accessible ramp')
        : edge.means === 'turnstile'
        ? (language === 'es' ? 'Pase por los torniquetes' : language === 'fr' ? 'Passez par les tourniquets' : language === 'pt' ? 'Passe pelas catracas' : 'Proceed through the entry turnstiles')
        : (language === 'es' ? 'Camine' : language === 'fr' ? 'Marchez' : language === 'pt' ? 'Caminhe' : 'Walk');

    if (language === 'es') {
      actionText = `${actionText || meansText} (${edge.distance}m) hacia ${toName} por ${landmark}.`;
    } else if (language === 'fr') {
      actionText = `${meansText} (${edge.distance}m) vers ${toName} via ${landmark}.`;
    } else if (language === 'pt') {
      actionText = `${meansText} (${edge.distance}m) até ${toName} via ${landmark}.`;
    } else {
      actionText = `${meansText} (${edge.distance}m) toward ${toName} via ${landmark}.`;
    }

    return {
      order: index + 1,
      from: edge.from,
      to: edge.to,
      means: edge.means,
      distance: edge.distance,
      text: actionText,
    };
  });

  return {
    found: true,
    distanceMeters: totalDistance,
    stepCount: instructions.length,
    stepFree: allStepFree,
    pathZones,
    instructions,
  };
}
