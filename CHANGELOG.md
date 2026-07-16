# Changelog

All notable changes to the Aficionado AI project are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/) formatting.

## [1.1.0] — 2026-07-16

### Added
- **Centralized Gemini client factory** (`geminiClient.js`) — all AI access now
  flows through a single module for consistent offline detection, API key handling,
  and error behavior.
- **Architecture Decision Log** (`docs/decisions.md`) — 14 numbered rationale
  entries explaining key technical tradeoffs.
- **Accessibility Audit Report** (`docs/accessibility-report.md`) — formal
  WCAG 2.1 AA audit with contrast measurements and ARIA verification.
- **Type checking enforcement** (`jsconfig.json`) — `checkJs: true` enables
  JSDoc-based type checking across the codebase.
- Named constants for crowd thresholds, kickoff urgency, and offline API key
  patterns in `constants.js`.

### Changed
- **DRY refactor: translation dictionaries** — replaced ~12 repeated 4-language
  if/else chains in `contextEngine.js` and `offlinePhrasingEngine.js` with
  structured `TRANSLATIONS` / `PHRASING` lookup dictionaries and `localize()` /
  `phrase()` helpers.
- **Unified Gemini model initialization** — `geminiChat.js` and
  `geminiBriefing.js` now use shared `getChatModel()` / `getBriefingModel()` from
  `geminiClient.js` instead of duplicated `getModel()` functions.
- Replaced all magic numbers (`75`, `50`, `15`, `5000`) with named constants
  from `constants.js`.
- Tightened Content Security Policy with `form-action 'self'` and
  `frame-ancestors 'none'`.

### Fixed
- **Typo in exported constant**: renamed `STADUM_GRAPH` → `STADIUM_GRAPH` in
  `routingService.js` and all test references.

## [1.0.0] — 2026-07-12

### Added
- Three-persona architecture: Fan Chat, Ops Dashboard, Organizer Portal.
- Gemini 2.5 Flash-powered multilingual fan assistant (EN, ES, FR, PT).
- Deterministic rules engine with Dijkstra wayfinding and ADA step-free routing.
- Real-time crowd density simulation with automatic gate rerouting.
- Offline fallback engine for zero-API-key operation during evaluation.
- Token-bucket rate limiting and LRU caching for API cost control.
- Input validation and prompt injection guardrails.
- 194+ unit tests with 95%+ coverage thresholds.
- Event-scoped URLs with Supabase-backed organizer authentication.
- Comprehensive README, CONTRIBUTING.md, and SECURITY.md documentation.
- ESLint (with jsx-a11y), Prettier, and GitHub Actions CI pipeline.
