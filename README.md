# Aficionado AI 🏟️⚽

> Multilingual AI companion connecting fans and operations staff for smarter, safer FIFA World Cup 2026 stadiums.

![CI](https://img.shields.io/badge/CI-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-4285f4)

---

## Chosen Vertical

**Fan Experience + Operational Intelligence** — connected via a shared GenAI layer for FIFA World Cup 2026.

Aficionado AI is a closed-loop system where:
- **Fans** interact with a multilingual AI chat concierge (EN/ES/FR/PT) grounded in venue data
- **Operations staff** receive AI-generated briefings synthesized from fan query patterns + crowd density data
- Every fan interaction feeds anonymized data into the ops layer — this connection IS the product

---

## Approach and Logic

### Why This Concept
The 2026 FIFA World Cup spans three countries (USA, Mexico, Canada) with multilingual crowds in venues holding 80,000+ fans. The gap isn't just "one chatbot" or "one dashboard" — it's the intelligence layer connecting what fans are asking with what operations staff need to know.

### Why GenAI Is Load-Bearing
- **Fan Chat**: Gemini generates multilingual, grounded responses from structured venue data — not template matching, genuine language generation
- **Ops Briefings**: Gemini synthesizes crowd density + query patterns into actionable natural-language recommendations — change the data, the briefing changes meaningfully
- **Language Detection**: Gemini's native multilingual capabilities handle four languages without separate translation services

### The Closed-Loop Architecture
```
Fan asks "¿Dónde está la Puerta C?" →
  → Logged as: {lang: "es", intent: "navigation", zone: "gate-c"} →
  → Ops AI sees: "12 Spanish-language navigation queries at Gate C in 10 min" →
  → Briefing: "Deploy bilingual staff to Gate C"
```

---

## How the Solution Works

See [Architecture Documentation](docs/architecture.md) for detailed diagrams.

### Fan Chat Pipeline
1. User types question → input validated & sanitized
2. Language auto-detected (EN/ES/FR/PT)
3. Intent classified via multilingual keyword matching
4. Relevant venue data retrieved from knowledge base
5. Gemini generates grounded response with source citations
6. Response cached (LRU) for repeated common questions

### Ops Briefing Pipeline
1. Fan queries logged (anonymized: language + intent + zone only)
2. Mock crowd sensors provide density data per gate/zone
3. Gemini synthesizes both data streams into operational briefing
4. Briefing includes status assessment + recommended actions

---

## Challenge Focus Area Coverage

| Focus Area | Feature | How GenAI Powers It |
|---|---|---|
| **Navigation** | Fan chat: "How do I get to Gate C?" | Gemini generates turn-by-turn directions from venue knowledge base |
| **Crowd Management** | Ops briefing: crowd density alerts + recommendations | Gemini synthesizes mock sensor data into actionable crowd-flow recommendations |
| **Accessibility** | Wheelchair-aware routing, screen reader support, WCAG AA | Gemini filters routes by accessibility flags; UI built with semantic HTML + ARIA |
| **Transportation** | Fan chat: transit directions to/from venue | Gemini generates multimodal transit plans grounded in transit data |
| **Sustainability** | Transit-first recommendations, paperless digital assistant | Gemini prioritizes low-carbon transport options; no paper maps/guides needed |
| **Multilingual** | Auto-detect + reply in fan's language (EN/ES/FR/PT) | Gemini's native multilingual generation — justified by USA/Mexico/Canada host countries |
| **Operational Intelligence** | Ops briefing: query pattern analysis + trend detection | Gemini identifies trends across anonymized fan query data |
| **Real-time Decision Support** | Ops briefing: context-aware staff action recommendations | Gemini generates recommended actions from combined crowd + query data |

---

## Assumptions Made

- **Mock/synthetic data** used in place of live stadium APIs (not publicly available)
- **Language set** limited to EN/ES/FR/PT for demo scope (justified by host country languages)
- **Crowd density data** is simulated, not from real sensors — clearly labeled "SIMULATED" in UI
- **Venue knowledge base** represents MetLife Stadium (New York/New Jersey) as a single representative venue
- **Client-side Gemini calls** for demo simplicity; production would use server-side proxy
- **In-memory caching/rate limiting** for single-instance demo; production would use Redis

---

## Setup & Run Instructions

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key

### Quick Start
```bash
# 1. Clone the repository
git clone <repo-url>
cd aficionado-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys:
#   VITE_GEMINI_API_KEY=your-key
#   VITE_SUPABASE_URL=your-url
#   VITE_SUPABASE_ANON_KEY=your-key

# 4. Start development server
npm run dev

# 5. Open in browser
# Fan View: http://localhost:5173/fan
# Ops View: http://localhost:5173/ops
```

### Demo Walkthrough
1. Open **/fan** — try suggested questions or ask in Spanish/Portuguese
2. Open **/ops** in another tab — see your queries appear in the feed
3. Click **"Simulate Incident"** — crowd data spikes at Gate C
4. Click **"Generate Briefing"** — AI produces actionable ops recommendations
5. Clear the incident and generate again — notice the briefing changes meaningfully

---

## Security & Responsible AI

See [Responsible AI Documentation](docs/responsible-ai.md) for full details.

**Key measures:**
- ✅ API keys via environment variables (never hardcoded)
- ✅ Startup validation fails fast on missing config
- ✅ Input validation: max 1000 chars, HTML sanitization, null byte removal
- ✅ System prompt isolation (user input never in system role)
- ✅ Prompt injection guardrails + automated tests
- ✅ Rate limiting (token bucket)
- ✅ No PII collected (language + intent + zone only)
- ✅ Grounded responses with source citations (no hallucination)

---

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
| Test Suite | What It Covers |
|---|---|
| `validation.test.js` | Input validation edge cases, sanitization, multilingual input |
| `cache.test.js` | LRU eviction, TTL expiry, promotion, overwrite |
| `rateLimiter.test.js` | Token bucket consumption, refill, exhaustion |
| `errors.test.js` | Error hierarchy, codes, response envelope formatting |
| `knowledgeBase.test.js` | Intent classification accuracy, context retrieval |
| `promptInjection.test.js` | 8 injection patterns, system prompt leak prevention |

---

## Known Limitations & Future Scope

### Demo Limitations
- Client-side API key (would be server-side in production)
- In-memory rate limiting/caching (would use Redis)
- Mock crowd data (would use real sensor APIs)
- Single venue (would support multiple World Cup venues)
- No persistent user sessions

### Future Enhancements
- Server-side Gemini calls via Supabase Edge Functions
- Real-time Supabase Realtime for ops dashboard
- Push notifications for fans (gate changes, crowd alerts)
- Voice input for accessibility
- Integration with ticketing system for personalized routing
- Multi-venue support with venue selection
- Historical analytics for ops staff

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| AI | Google Gemini 2.5 Flash |
| Backend | Supabase (client SDK) |
| Grounding | Local JSON knowledge base |
| Testing | Vitest |
| CI | GitHub Actions |

---

*Built with ❤️ for Google Prompt Wars × Hack2Skill — Challenge 4: Smart Stadiums & Tournament Operations*
