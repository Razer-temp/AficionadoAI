# Contributing to Aficionado AI

Thanks for your interest. This document explains how to set up the project, the
quality bar every change must clear, and how to contribute effectively.

## Prerequisites

- **Node.js ≥ 18** and npm 9+
- A Google Gemini API key for running the assistant locally
- A Supabase project (URL + anon key) for database features

## Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd aficionado-ai
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys:
#   VITE_GEMINI_API_KEY=your-key
#   VITE_SUPABASE_URL=your-url
#   VITE_SUPABASE_ANON_KEY=your-key

# 3. Start development server
npm run dev
```

## Project Layout

```
aficionado-ai/
├── src/
│   ├── components/          React components by feature area
│   │   ├── fan/             Fan chat assistant
│   │   ├── ops/             Operations dashboard
│   │   ├── organizer/       Organizer management
│   │   ├── gate/            Event access gating
│   │   ├── landing/         Landing page
│   │   └── shared/          Shared UI components
│   ├── services/            Gemini + Supabase + Knowledge Base
│   ├── utils/               Pure utilities (cache, validation, errors)
│   ├── data/                Mock data (crowd, weather)
│   └── styles/              CSS modules by feature
├── tests/
│   ├── unit/                Unit tests
│   └── security/            Security-focused tests
├── docs/                    Architecture, decisions, accessibility
└── .github/workflows/       CI configuration
```

## Quality Bar (All Enforced in CI)

Run these before pushing — CI fails on any of them:

| Command                 | What It Checks                                                  |
| ----------------------- | --------------------------------------------------------------- |
| `npm run lint`          | ESLint with `jsx-a11y`, **zero warnings** (`--max-warnings 0`)  |
| `npm run test`          | Vitest — all unit and security tests pass                       |
| `npm run test:coverage` | Vitest with **≥ 95%** line/branch/function/statement thresholds |
| `npm run build`         | Production build of the client (Vite)                           |
| `npm run format:check`  | Prettier formatting check                                       |

## Tests

- Tests live in `tests/` and mirror the `src/` structure.
- Cover the **happy path, edge cases, and error paths** — a new service or
  utility without an error-path test will not be merged.
- Security tests belong in `tests/security/`.
- Run `npm run test:watch` for interactive development.

## Commit and PR Conventions

- **Conventional Commits**, imperative mood, scoped where useful:
  `feat(assistant): add Portuguese language option`,
  `fix(ops): guard empty briefing data`.
- One logical change per commit; no `wip`/`asdf`/`final2`.
- Open a PR against `main`, fill in the template, and ensure CI is green.
- Do not commit generated artifacts (`dist/`, `coverage/`, `node_modules/`, `.env`).

## Code Style

- **ESLint** enforces code quality and accessibility rules.
- **Prettier** handles formatting (config in `.prettierrc`).
- **EditorConfig** ensures consistent editor settings (`.editorconfig`).
- **JSDoc** annotations required on all exported functions.

## Reporting Security Issues

Do **not** open a public issue with exploit details. Follow
[SECURITY.md](SECURITY.md).
