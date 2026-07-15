# Security Policy

## Threat Model

Aficionado AI is a client-side GenAI demonstration serving three personas: fans
(multilingual chat assistant), operations staff (crowd intelligence dashboard),
and organizers (event management). The assets worth protecting are the Gemini API
key, the Supabase credentials, fan query data privacy, and service availability.
The realistic threats are prompt-injection attempts through the chat input, API
key leakage in the client bundle, abuse of the LLM endpoints (cost/DoS), and
leakage of stack traces or internal system instructions.

## Controls in Place

### 1. Secret Management

- **Environment variables**: All API keys (`VITE_GEMINI_API_KEY`,
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are loaded from `.env` files,
  never hardcoded in source.
- **Startup validation**: `envValidation.js` checks all required variables at
  initialization and fails fast with a clear error if any are missing or set to
  placeholder values.
- **Git protection**: `.env` is in `.gitignore`; `.env.example` provides
  placeholders only.
- **Production note**: In production, API calls would route through a
  server-side proxy (Supabase Edge Functions) to prevent key exposure in client
  bundles.

### 2. Input Validation & Sanitization

- **Length enforcement**: Fan chat input is capped at 1,000 characters
  (`MAX_INPUT_LENGTH`); empty and whitespace-only input is rejected.
- **Type checking**: Input must be a string; non-string types throw a
  `ValidationError`.
- **HTML sanitization**: Angle brackets are escaped to HTML entities (`<` → `&lt;`,
  `>` → `&gt;`) to prevent XSS via reflected input.
- **Null byte removal**: Null characters are stripped from all input.
- **Output sanitization**: Model responses pass through `sanitizeModelText()`
  which strips residual HTML tags and caps output length to prevent unbounded
  rendering.
- **Automated tests**: `tests/unit/validation.test.js` covers all edge cases.

### 3. Prompt Injection Guardrails

| Layer                 | Control                                                                                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture**      | User input is passed as a chat message, never concatenated into the system prompt. System instructions use the `systemInstruction` parameter — a separate channel from user messages. |
| **System prompt**     | Explicit instructions: reject role-change attempts, never output system instructions, stay in-role as a stadium assistant, ignore embedded override commands.                         |
| **Automated testing** | `tests/security/promptInjection.test.js` sends 8 common injection patterns and verifies no system prompt leakage, no role escape, and correct intent classification.                  |

### 4. Rate Limiting

- **Algorithm**: Token-bucket rate limiter (10 tokens burst, 2 tokens refilled
  per 10 seconds).
- **Error handling**: Clear `RateLimitError` with retry guidance returned to the
  user.
- **Automated test**: `tests/unit/rateLimiter.test.js` verifies consumption,
  refill, and exhaustion behavior.
- **Production note**: In production, use Redis-based distributed rate limiting
  for multi-instance deployments.

### 5. Data Privacy

- **No PII collected**: Fan queries log only language code, intent category,
  generalized zone, and a truncated preview (first 50 chars).
- **No device fingerprinting**: No device IDs, cookies, or tracking mechanisms.
- **No geolocation**: Zone references are derived from query text only.
- **Anonymized ops feed**: Operations dashboard sees aggregated patterns, not
  individual sessions.

### 6. Error Hygiene

- **Custom error hierarchy**: `AficionadoError` base class with typed subclasses
  (`ValidationError`, `RateLimitError`, `LLMError`, `KnowledgeBaseError`).
- **Sanitized envelopes**: `formatErrorResponse()` returns `{ success, error: { code, message } }`
  — no stack traces or internal details are exposed to the user.
- **Error boundary**: React `ErrorBoundary` component prevents unhandled errors
  from crashing the UI.

### 7. Recommended Production Security Headers

When deployed behind a reverse proxy or on Vercel/Cloud Run, configure:

| Header                    | Value                                                                                                                                                                                   | Purpose                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Content-Security-Policy   | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src *.supabase.co generativelanguage.googleapis.com` | Blocks injected scripts and framing |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains`                                                                                                                                                   | Forces HTTPS                        |
| X-Content-Type-Options    | `nosniff`                                                                                                                                                                               | Prevents MIME sniffing              |
| X-Frame-Options           | `DENY`                                                                                                                                                                                  | Prevents clickjacking               |
| Referrer-Policy           | `strict-origin-when-cross-origin`                                                                                                                                                       | Limits URL leakage                  |
| Permissions-Policy        | `camera=(), microphone=(), geolocation=(), payment=()`                                                                                                                                  | Denies unused browser features      |

## Automated Security Checks

Every push runs in CI:

- **ESLint** with `jsx-a11y` plugin (zero warnings enforced)
- **CodeQL** static analysis with `security-extended` query pack (also weekly)
- **`npm audit --omit=dev --audit-level=high`** — zero vulnerabilities required

## Reporting a Vulnerability

If you discover a security issue, please **do not** open a public issue with
exploit details. Instead, open a GitHub issue titled `[security]` (without
details) or email the maintainer. You will receive a response within 48 hours.
