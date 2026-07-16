# Contributing to Aficionado AI

Thank you for your interest in contributing to Aficionado AI! This document outlines the
project architecture, coding standards, and development workflow.

## Architecture Overview

```
aficionado-ai/
├── src/
│   ├── components/           # React components organized by feature area
│   │   ├── fan/              # FanChat, ChatMessage, TypingIndicator, LanguageBadge
│   │   ├── ops/              # OpsDashboard, CrowdDensityMap, FanQueryFeed, BriefingPanel
│   │   ├── organizer/        # OrganizerDashboard, Auth context/gate, Login
│   │   ├── gate/             # EventGate, OpsGate, EventContext
│   │   ├── landing/          # Decomposed landing page (HeroSection, FanSimulator, etc.)
│   │   └── shared/           # Header, ErrorBoundary, LoadingSpinner
│   ├── hooks/                # Custom React hooks (useLandingSimulator)
│   ├── services/             # API/business logic (geminiChat, geminiBriefing, knowledgeBase)
│   ├── utils/                # Pure utilities (cache, validation, rateLimiter, errors)
│   ├── data/                 # Mock data modules (crowdData, weatherData)
│   └── styles/               # CSS per component (fan, ops, gate, organizer, landing, shared)
├── tests/
│   ├── unit/                 # Unit tests for utils and services
│   └── security/             # Prompt injection and security tests
└── venue-knowledge.json      # Structured venue knowledge base for RAG grounding
```

## Design Principles

1. **Single Responsibility** — Each component handles one concern. Large components are
   decomposed into focused sub-components with shared state via custom hooks.

2. **Grounded AI** — Gemini calls always carry authoritative venue data via `systemInstruction`.
   The model never invents venue facts.

3. **Deterministic Logic Outside LLM** — Safety-critical classifications (crowd density levels)
   are computed in unit-tested code, not by the LLM.

4. **Security by Default** — Input validation, output sanitization, rate limiting, and prompt
   injection guardrails are mandatory for all user-facing AI interactions.

## Development Workflow

### Prerequisites

- Node.js 18+
- Google Gemini API key
- Supabase project (URL + anon key)

### Setup

```bash
git clone <repo-url>
cd aficionado-ai
npm install
cp .env.example .env
# Fill in API keys in .env
```

### Commands

| Command               | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start development server (port 5173)       |
| `npm run build`       | Production build to `dist/`                |
| `npm run lint`        | ESLint with zero-warning policy            |
| `npm run format`      | Prettier auto-format                       |
| `npm run format:check`| Prettier check (CI)                        |
| `npm run test`        | Run all tests                              |
| `npm run test:watch`  | Watch mode testing                         |
| `npm run test:coverage`| Tests with 95%+ coverage thresholds       |

### Code Standards

- **ESLint** with `jsx-a11y` plugin — zero warnings enforced
- **Prettier** for consistent formatting
- **EditorConfig** for cross-editor consistency
- **JSDoc** on all exported functions and module headers
- **No inline styles** — use CSS classes in `src/styles/`
- **No `console.log`** — only `console.warn` and `console.error` allowed

### Testing Standards

- Unit tests in `tests/unit/` using Vitest
- Security tests in `tests/security/` for prompt injection patterns
- Coverage thresholds: 95% lines, 95% functions, 90% branches, 95% statements
- All tests must pass before merge

### Commit Messages

Use conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `test:` — Adding or updating tests
- `docs:` — Documentation changes
- `style:` — Formatting, CSS changes

## Accessibility Requirements

All UI contributions must follow WCAG 2.1 AA:
- Semantic HTML landmarks and heading hierarchy
- `aria-label` on all icon-only buttons
- `aria-live` regions for dynamic content
- Visible `:focus-visible` rings
- `prefers-reduced-motion` support
- `lang` attribute on multilingual content

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
