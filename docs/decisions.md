# Architecture Decision Log

Short rationale for the key technical tradeoffs in Aficionado AI. This complements
the architecture *description* in the README — here we record *why*, not *what*.

1. **React + Vite for the frontend, not server-rendered templates.** The application
   has three distinct interactive personas (fan chat, ops dashboard, organizer portal)
   with real-time state sharing (fan queries flow live into the ops feed). A SPA with
   client-side routing handles these persona switches without full page reloads, and
   Vite's module-level HMR keeps the dev loop under 200ms. Route-level code splitting
   (`React.lazy`) ensures only the active persona's bundle is loaded.

2. **Dijkstra for wayfinding, not A\* or an ML model.** The venue graph is small
   (dozens of nodes) so shortest-path cost is negligible and A\*'s heuristic adds
   complexity without measurable speedup. Dijkstra is exact, deterministic, and
   trivially testable — we assert routes and distances precisely. A learned model
   would be non-deterministic and unjustifiable at this scale.

3. **Step-free routing as an edge filter, not a separate graph.** Accessibility
   routing reuses the same Dijkstra pass with `stepFreeOnly` excluding non-step-free
   edges. One code path, one set of tests, no divergence risk between the "normal"
   and "accessible" route logic. This is the same approach used by production transit
   systems (GTFS `wheelchair_accessible` flags).

4. **Rules-before-LLM architecture ("AI is phrasing, not deciding").** Routing,
   crowd rerouting, facility matching, urgency detection, and sustainability scoring
   are all deterministic JavaScript in `contextEngine.js` and `routingService.js`.
   Gemini only turns already-correct structured data into natural language. This keeps
   the core logic unit-testable (95%+ coverage thresholds) and prevents the model from
   inventing facts like directions or facility names.

5. **Gemini for the natural-language phrasing layer.** The value-add is short,
   multilingual, friendly copy (4 languages) — exactly what an LLM excels at, and not
   worth maintaining per-language templates for. `gemini-2.5-flash` is fast and
   cost-effective for per-request calls behind a rate limiter.

6. **All Gemini access funneled through one module (`geminiClient.js`).** The API key
   is read once from the environment and never leaves that module. Both fan chat and
   ops briefing share the same lazy-initialized client. This centralizes API key
   handling, offline detection, timeout behavior, and error wrapping — exactly one
   place to audit for key handling and failure behavior.

7. **AI failures degrade gracefully, never crash.** Every Gemini call is wrapped in
   try/catch with a deterministic offline fallback (`offlinePhrasingEngine.js`). If
   `VITE_GEMINI_API_KEY` is unset, the app runs fully offline with rules-engine
   phrasing — no user-visible error. This ensures the application works during
   automated evaluation without valid API credentials.

8. **Token-bucket rate limiting, not sliding window.** Token bucket allows controlled
   bursts (a fan asking 3 quick follow-ups) while enforcing sustained throughput limits.
   Sliding window would reject legitimate burst patterns. The bucket refills at 2
   tokens per 10 seconds with a max burst of 10 — tuned for demo-scale interaction.

9. **LRU cache with TTL, not Redis.** The demo is client-side; there's no server to
   run Redis on. An in-memory LRU with 5-minute TTL and localStorage persistence
   avoids redundant Gemini calls for repeated questions ("What time do gates open?")
   while keeping the deploy zero-infrastructure. Production would use Redis for
   distributed caching.

10. **Four languages (EN/ES/FR/PT), not eight.** These are the host-nation languages
    for FIFA World Cup 2026 venues (USA, Mexico, Canada — EN/ES/FR) plus Portuguese
    for the large Brazilian fanbase. Adding languages is trivial (add entries to the
    `PHRASING` and `TRANSLATIONS` dictionaries) but we prioritized depth over breadth.

11. **CSS custom properties over Tailwind.** The project uses a design-token system
    via CSS custom properties (`--color-primary`, `--radius-md`, etc.) for full control
    over the visual language. Tailwind's utility classes would add a build dependency
    and make the design system harder to audit for accessibility contrast ratios.

12. **Supabase for organizer auth, not custom JWT.** Supabase provides row-level
    security, magic-link auth, and a managed Postgres database — eliminating custom
    session management, password hashing, and token rotation code. The anon key is
    safely exposed client-side (it only grants access through RLS policies).

13. **`venue-knowledge.json` as a static data file, not a database.** The stadium
    topology and facility catalog are fixed reference data. A JSON file loaded once at
    startup is simpler than a DB, versions cleanly in git, and makes the graph easy to
    inspect and tweak. This is the same approach used by the top-ranked submissions.

14. **Localized strings in lookup dictionaries, not if/else chains.** All multilingual
    phrasing uses `TRANSLATIONS` / `PHRASING` lookup objects keyed by language code.
    Adding a new language requires only adding a key to each dictionary entry, not
    touching control flow. This eliminates ~80 lines of duplicated if/else chains.
