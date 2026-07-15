# Architecture Decision Records

Key design decisions and their rationale for Aficionado AI.

---

## ADR-001: Client-Side Gemini Calls

**Status**: Accepted (demo scope)
**Context**: The fan chat and ops briefing require Gemini API calls. We could
route them through a backend (Supabase Edge Functions, Express server) or call
directly from the client.
**Decision**: Call Gemini directly from the client using `@google/generative-ai`.
**Rationale**: Hackathon demo simplicity — avoids deploying and maintaining a
separate API server. The API key is in an environment variable (not hardcoded)
and `envValidation.js` checks it at startup.
**Trade-off**: The API key is bundled into the Vite client build. In production,
all Gemini calls would route through a server-side proxy to protect the key.
**Consequences**: Rate limiting must be client-side (token bucket in
`rateLimiter.js`), not enforceable at the network level.

---

## ADR-002: Local JSON Knowledge Base (Not Vector DB)

**Status**: Accepted
**Context**: The assistant needs to answer from a curated venue dataset. Options:
vector database (e.g., Pinecone), RAG pipeline, or structured JSON.
**Decision**: Use a structured JSON knowledge base (`venue-knowledge.json`)
with keyword-based intent classification and section retrieval.
**Rationale**: The venue dataset is finite, curated, and structured (gates,
sections, facilities, policies). This fits keyword matching far better than
embedding-based retrieval. No vector overhead, no embedding cost, deterministic
retrieval, and easy to inspect and update.
**Consequences**: If the dataset grew to thousands of documents, we would need
to switch to vector retrieval.

---

## ADR-003: System Prompt Isolation

**Status**: Accepted
**Context**: Prompt injection is the #1 security risk in LLM-powered apps.
**Decision**: Pass the system prompt via `systemInstruction` (a separate
parameter), never concatenating user input into the system role.
**Rationale**: The Gemini SDK's `systemInstruction` parameter creates a hard
boundary between system instructions and user messages. Combined with explicit
guardrail instructions ("ignore override attempts"), this provides defense in
depth.
**Consequences**: System prompt can be longer (no sharing with user messages),
but the architecture is safer.

---

## ADR-004: LRU Cache with TTL

**Status**: Accepted
**Context**: Common fan questions ("What time do gates open?") will repeat
thousands of times. Each uncached call costs tokens and latency.
**Decision**: In-memory LRU cache with configurable TTL (5 minutes default,
50 entries max).
**Rationale**: Map-based LRU is simple, zero-dependency, and perfectly adequate
for a single-instance demo. The TTL prevents stale answers; LRU eviction
prevents unbounded memory growth.
**Trade-off**: Not shared across browser tabs or instances. Production would
use Redis.

---

## ADR-005: Closed-Loop Architecture (Fan → Ops)

**Status**: Accepted
**Context**: Most hackathon projects build either a chatbot OR a dashboard.
**Decision**: Every fan interaction feeds anonymized data (language, intent,
zone) into the ops layer. The ops briefing consumes both fan query patterns
and crowd density data.
**Rationale**: This is the core differentiator. The intelligence layer
connecting what fans are asking with what operations staff need to know is
the product — not just a chatbot or a dashboard.
**Consequences**: State must flow between components (via React state lifting),
and the briefing prompt must synthesize two data streams.

---

## ADR-006: Token-Bucket Rate Limiting

**Status**: Accepted
**Context**: Need to prevent abuse of the Gemini endpoint without blocking
legitimate users.
**Decision**: Token-bucket algorithm (burst capacity + steady refill).
**Rationale**: Token bucket allows short bursts (fan asking 3 quick questions)
while enforcing a sustained rate limit. More user-friendly than fixed-window
limiters. Configuration: 10 tokens max, 2 refilled per 10 seconds.
**Consequences**: Client-side only; users could bypass by clearing state.
Production would enforce at the API gateway level.

---

## ADR-007: Three-Persona Architecture

**Status**: Accepted
**Context**: The problem statement mentions fans, organizers, volunteers, and
venue staff.
**Decision**: Build three distinct personas: Fan (chat assistant), Ops
(operations dashboard), and Organizer (event management).
**Rationale**: Each persona has fundamentally different needs and UI patterns.
The fan needs a conversational interface; ops needs a real-time dashboard; the
organizer needs CRUD for event configuration. A shared GenAI layer (Gemini)
serves all three.
**Consequences**: Larger codebase, but each persona is clearly separated in
`src/components/` with dedicated routing.

---

## ADR-008: Event Gating System

**Status**: Accepted
**Context**: Events at a real stadium would need access control — not everyone
should access every event's chat or ops dashboard.
**Decision**: Implement event gating with URL-based slug routing, optional
claim codes for fans, and ops access keys for staff.
**Rationale**: Demonstrates real-world access control patterns. Each event
(e.g., `/event/usa-vs-mexico`) has its own fan and ops surfaces. Organizers
create events and distribute access links.
**Consequences**: More complex routing (both `/fan` and `/event/:slug/fan`),
but demonstrates production-ready architecture thinking.
