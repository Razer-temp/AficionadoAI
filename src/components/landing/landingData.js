/**
 * Static data constants for the landing page.
 * Extracted for separation of concerns — keeps components focused on rendering.
 * @module landingData
 */

import {
  Globe,
  Navigation,
  Train,
  Accessibility,
  Activity,
  Shield,
  Settings,
  QrCode,
  Sparkles,
  Leaf,
} from 'lucide-react';

/** Interactive simulator presets with categorized short labels & scenarios */
export const SIMULATOR_PROMPTS = [
  {
    id: 'gate-en',
    lang: 'EN',
    flag: '🇺🇸',
    shortLabel: '🗺️ Gate C to Sec 112',
    category: 'Navigation & Topology',
    icon: Navigation,
    query: 'How do I get from Gate C to Section 112?',
    groundingStep:
      '🔍 Retrieving MetLife Stadium 3D Topology Maps (Section 112) & Gate C sensors...',
    fullAiResponse:
      'Take the Express Concourse Escalator B up one level. Section 112 is directly on your left past the Coca-Cola Refresh station. Live walking time: ~3 mins.',
    badge: '🚶 3 mins walk',
    badgeColor: 'emerald',
    crowdStatus: 'Low Crowd (Current wait: 1 min)',
    audioSnippet: 'Responded in English (EN) · WCAG AA Grounded',
  },
  {
    id: 'food-es',
    lang: 'ES',
    flag: '🇪🇸',
    shortLabel: '🌮 Comida Halal/Vegana',
    category: 'Halal & Vegan Food',
    icon: Globe,
    query: '¿Dónde venden comida vegetariana o halal cerca de mí?',
    groundingStep:
      '🌱 Verifying real-time inventory & Halal certification at Vendor Level 2 (Section 204)...',
    fullAiResponse:
      'El puesto "Green Stadium Bowl" está en el Nivel 2, Sección 204 (a 2 min a pie). Cuentan con certification Halal y menú 100% vegetariano verificado hoy.',
    badge: '🌱 Halal & Vegano',
    badgeColor: 'cyan',
    crowdStatus: 'Fila corta (Aprox. 3 mins)',
    audioSnippet: 'Responded in Spanish (ES) · Real-time Menu Grounding',
  },
  {
    id: 'access-fr',
    lang: 'FR',
    flag: '🇫🇷',
    shortLabel: '♿ Ascenseur PMR',
    category: 'WCAG AA Accessibility',
    icon: Accessibility,
    query: 'Où se trouve l\u2019ascenseur accessible aux fauteuils roulants ?',
    groundingStep:
      '♿ Checking WCAG AA step-free elevator priority status & dispatching concierge alert...',
    fullAiResponse:
      'L\u2019ascenseur Priorité Accessibilité E-2 est situé directement en face de la Porte A. Le personnel de conciergerie a été notifié pour vous assurer un accès immédiat.',
    badge: '♿ Accès Prioritaire',
    badgeColor: 'amber',
    crowdStatus: 'Réservé PMR (0 min d\u2019attente)',
    audioSnippet: 'Responded in French (FR) · ADA / WCAG Priority Route',
  },
  {
    id: 'transit-pt',
    lang: 'PT',
    flag: '🇧🇷',
    shortLabel: '🚆 Saída NJ Transit',
    category: 'Multi-Modal Transit',
    icon: Train,
    query: 'Qual é a melhor saída para pegar o trem NJ Transit após o jogo?',
    groundingStep:
      '🚆 Analyzing multi-modal transit departures & pedestrian corridor flow rates...',
    fullAiResponse:
      'Use o Portão Sul (Gate S). Os trens expressos com destino a Penn Station estão partindo a cada 10 minutos. O fluxo de multidão está otimizado nesta rota.',
    badge: '🚆 NJ Transit Express',
    badgeColor: 'purple',
    crowdStatus: 'Fluxo Moderado (5 mins até a plataforma)',
    audioSnippet: 'Responded in Portuguese (PT) · Multi-modal Transit Feed',
  },
];

/** Live Ops Telemetry simulation initial events */
export const INITIAL_OPS_FEED = [
  {
    id: 1,
    time: 'Just now',
    query: 'Gate C to Section 112',
    lang: 'EN',
    impact: 'Normal flow · Route optimized via Concourse B',
  },
  {
    id: 2,
    time: '12s ago',
    query: 'Comida Halal / Vegana',
    lang: 'ES',
    impact: 'Vendor 204 demand +8% · Stock verified',
  },
  {
    id: 3,
    time: '34s ago',
    query: 'Wheelchair elevator assist',
    lang: 'FR',
    impact: 'Steward alert sent to Gate A elevator',
  },
];

/** Interactive Bento grid feature cards */
export const FEATURES = [
  {
    title: 'Multilingual AI Concierge',
    desc: 'Real-time responses in English, Spanish, French, and Portuguese. Auto-detects your language and responds naturally with sub-second latency.',
    icon: Globe,
    iconStyle: 'green',
    wide: true,
    tags: ['English', 'Español', 'Français', 'Português'],
    interactiveType: 'language-preview',
  },
  {
    title: 'Venue Navigation & Topology',
    desc: 'Turn-by-turn directions grounded in real stadium architectural data. Gates, concourses, elevators, and seating sections mapped dynamically.',
    icon: Navigation,
    iconStyle: 'blue',
    tags: ['Grounded Map', 'Real-Time Routing'],
    interactiveType: 'route-preview',
  },
  {
    title: 'Multi-Modal Transit Planning',
    desc: 'Live transit routes connecting the city to the stadium. Updates in real time for rail, bus, rideshare, and pedestrian corridors.',
    icon: Train,
    iconStyle: 'green',
    tags: ['NJ Transit', 'Subway / Rail', 'Rideshare'],
    interactiveType: 'transit-preview',
  },
  {
    title: 'Accessibility First (WCAG AA)',
    desc: 'Dedicated wheelchair-accessible routes, sensory quiet rooms, and elevator priority passes. Built from the ground up for inclusive access.',
    icon: Accessibility,
    iconStyle: 'amber',
    tags: ['WCAG AA Compliant', 'ADA Routes', 'Sensory Rooms'],
    interactiveType: 'access-preview',
  },
  {
    title: 'Operations Intelligence & Heatmaps',
    desc: 'AI-generated briefings synthesized from crowd density sensors and fan query patterns. Actionable, automated recommendations for event staff.',
    icon: Activity,
    iconStyle: 'purple',
    tags: ['Crowd Heatmaps', 'AI Staff Briefings', 'Surge Prevention'],
    interactiveType: 'ops-preview',
  },
  {
    title: 'Secure Event Gate & Access Control',
    desc: 'Unique time-gated invite links with optional claim codes and QR verification. Organizers control rules, access windows, and capacity.',
    icon: Shield,
    iconStyle: 'blue',
    tags: ['Invite-Only Links', 'Claim Codes', 'QR Scan Ready'],
    interactiveType: 'security-preview',
  },
  {
    title: 'Sustainability & Volunteer Ops',
    desc: 'Live tracking of zero-waste initiatives, recycling rates, and dynamic deployment of volunteer staff to high-need zones across the venue.',
    icon: Leaf,
    iconStyle: 'emerald',
    wide: true,
    tags: ['Zero-Waste', 'Volunteer Hub', 'Green Venue'],
    interactiveType: 'sustainability-preview',
  },
];

/** How it works steps with live interactive preview states */
export const STEPS = [
  {
    number: 1,
    title: 'Organizer Creates an Event',
    desc: 'Set up venue topology, access time windows, multilingual presets, and choose whether claim codes or QR scans are required.',
    icon: Settings,
    previewTitle: 'Organizer Management Console',
    previewBadge: 'Step 1 of 3 · Event Setup',
    previewContent:
      'Configure "FIFA World Cup Final 2026 — MetLife Stadium". Set gate access times, activate 4-language AI Concierge, and generate secure invite links in seconds.',
  },
  {
    number: 2,
    title: 'Fans Receive a Unique Link or QR',
    desc: 'Distribute instantly via ticket QR codes, email confirmations, SMS blasts, or stadium screens. No app download required — 100% web native.',
    icon: QrCode,
    previewTitle: 'Instant Mobile Web Access',
    previewBadge: 'Step 2 of 3 · Zero App Friction',
    previewContent:
      'Fan scans QR code or taps `/event/metlife-opener`. The system verifies their claim code and opens the AI Concierge formatted perfectly for their smartphone.',
  },
  {
    number: 3,
    title: 'AI Concierge & Ops Loop Activates',
    desc: 'Fans get instant, personalized, venue-grounded assistance in their language. Simultaneously, anonymized query volume feeds the Ops Command Center.',
    icon: Sparkles,
    previewTitle: 'Real-Time Closed Loop Intelligence',
    previewBadge: 'Step 3 of 3 · Live Synchronization',
    previewContent:
      'When 150 fans ask about Gate C restrooms, the AI Concierge guides them while instantly alerting Ops Staff to dispatch janitorial and crowd control units.',
  },
];

/** FAQ items for mobile accordion */
export const FAQ_ITEMS = [
  {
    question: 'Do stadium attendees need to download an app from the App Store or Google Play?',
    answer:
      'No! Aficionado AI is designed mobile-first as an instant progressive web experience. Fans simply scan a QR code on their ticket or tap an invite link, and the AI Concierge opens immediately inside any mobile browser (Safari, Chrome, etc.) with zero friction.',
  },
  {
    question: 'How does the AI Concierge know accurate details about my specific venue or gates?',
    answer:
      'Unlike generic chatbots, Aficionado AI is deeply grounded in your specific venue topology data, custom gate schedules, menu offerings, and security policies uploaded through the Organizer Dashboard. If a gate closes or a policy changes, the AI adapts instantly.',
  },
  {
    question: 'How does the closed loop between Fans and Operations Staff work?',
    answer:
      'Every question asked by a fan (e.g., "Where is the shortest restroom line?" or "Is Gate B open?") is processed anonymously. The Ops Command Center aggregates these queries into real-time heatmaps, early-warning crowd surge alerts, and AI-synthesized staff action plans.',
  },
  {
    question: 'Is attendee privacy and personal data protected?',
    answer:
      'Yes, absolutely. Aficionado AI collects ZERO personally identifiable information (PII). All queries are anonymized upon ingestion and used strictly for venue guidance and aggregate operations safety.',
  },
  {
    question: 'Which languages are currently supported by the AI Concierge?',
    answer:
      'The system currently provides native, real-time responses in English (EN), Spanish (ES), French (FR), and Portuguese (PT). It automatically detects the user\u2019s input language and responds fluently using Google Gemini 2.5 Flash.',
  },
];
