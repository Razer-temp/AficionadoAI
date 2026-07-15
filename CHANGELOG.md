# Changelog

All notable changes to Aficionado AI are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-07-15

### Added

- Organizer dashboard with event management, access control, and analytics.
- Event gating system with claim-code-based access and ops-key protection.
- Landing page with feature showcase, persona selection, and demo walkthrough.
- Route-level code splitting with `React.lazy()` and `Suspense` for all persona
  pages — reduces initial bundle to ~80 kB gzip.
- Skip-to-content link and `aria-live` regions for screen reader announcements.
- `prefers-reduced-motion` media query to honor user animation preferences.
- Output sanitization (`sanitizeModelText()`) strips HTML from model responses.
- CodeQL static analysis (`security-extended`) and npm audit in CI.
- Project documentation: `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `docs/decisions.md`, `docs/performance.md`, `docs/accessibility.md`,
  issue/PR templates, and `CODEOWNERS`.
- Additional test suites: `envValidation.test.js`, `constants.test.js`,
  `geminiChat.test.js`, `geminiBriefing.test.js`.
- Enforced 95% coverage thresholds in Vitest config.
- README sections for Problem Statement Alignment with R1–R8 traceability
  and an Evaluation Map.

### Changed

- CI workflow now runs with least-privilege `permissions: contents: read` and
  includes build, coverage, npm audit, and format check steps.
- Raised test coverage from ad-hoc to 95% enforced thresholds.

### Fixed

- Focus management: visible focus rings on all interactive elements.
- Contrast: status indicators now use text labels alongside color.

## [1.0.0] - 2026-07-14

### Added

- Multilingual Fan Chat Assistant: Gemini-grounded Q&A over MetLife Stadium
  venue dataset (navigation, accessibility, transportation, multilingual
  support in EN/ES/FR/PT).
- Operations Command Center: live crowd density map, fan query feed, AI
  operations briefing with simulate-incident capability.
- Closed-loop architecture: fan interactions feed anonymized data into the
  ops layer for real-time operational intelligence.
- Full security pipeline: input validation, HTML sanitization, null byte
  removal, prompt injection guardrails with automated tests, rate limiting
  (token bucket), and environment variable validation.
- LRU cache with TTL for repeated fan queries.
- Supabase integration for backend data persistence.
- CI with ESLint (jsx-a11y) and Vitest.
