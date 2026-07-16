# Security Policy — Aficionado AI

## Reporting a Vulnerability

If you discover a security vulnerability in Aficionado AI, please report it responsibly.

**Email:** security@aficionado-ai.dev (or open a private GitHub security advisory)

We will acknowledge your report within 48 hours and provide a resolution timeline within 5 business days.

## Security Measures

### Input Security
- **Input validation**: All user input is validated for length (max 1,000 chars) and content type
- **HTML sanitization**: `<` and `>` characters are entity-encoded to prevent XSS
- **Null byte removal**: Control characters stripped from all input
- **Rate limiting**: Token-bucket rate limiter (10 burst, 2 tokens per 10s refill)

### Prompt Security
- **System prompt isolation**: User input is NEVER concatenated into the system role — it passes through `systemInstruction` and user message channels separately
- **Prompt injection guardrails**: System prompt includes explicit instructions to reject role-override attempts
- **Automated injection tests**: 8 prompt injection patterns tested in CI (`promptInjection.test.js`)

### Output Security
- **Output sanitization**: Model responses are stripped of HTML tags and control characters before rendering
- **Response length cap**: Model output is truncated at 5,000 characters
- **Error hygiene**: Typed error hierarchy ensures internal error details are never exposed to users

### API Key Security
- **Environment variables**: All API keys stored in `.env`, never hardcoded
- **Startup validation**: Application validates required environment variables on boot and fails fast if missing
- **`.env.example`**: Template provided with placeholder values (never real keys)
- **`.gitignore`**: `.env` file is excluded from version control

### Database & Gated Access Security (Supabase)
- **Row Level Security (RLS)**: All Supabase tables (`events`, `claim_codes`, `event_sessions`) have strict RLS policies enabled. Organizers can only modify their own events and generated codes.
- **Atomic Claim Code Redemption**: Claim code redemption is handled via a secure PostgreSQL stored procedure (`claim_event_code`) to prevent race conditions and double-spending of tickets.
- **Encrypted Ops Access Keys**: Operations portal (`/event/:slug/ops`) requires an explicit access key (`ops_access_key`), validated via secure RPC `verify_ops_access_key` with zero-trust session tokens.
- **Time Window Verification**: Access checks strictly enforce ISO timestamp boundaries (`starts_at`, `ends_at`) on the server/database layer before granting fan or ops sessions.

### Data Privacy & Anonymization
- **Zero PII collection**: Only language, intent category, and zone are logged — no personal data
- **Anonymized analytics**: Fan query feed in ops dashboard contains no identifying information
- **No persistent sessions**: Fan interactions are not tied to user accounts

### Content Security Policy
- **CSP meta tags**: Restrictive Content-Security-Policy headers to prevent XSS and data exfiltration
- **Referrer-Policy**: `strict-origin-when-cross-origin` to prevent referrer leakage
- **X-Content-Type-Options**: `nosniff` to prevent MIME-type sniffing attacks

### CI/CD Security
- **CodeQL analysis**: GitHub CodeQL security-extended scanning on every push
- **npm audit**: `npm audit --omit=dev --audit-level=high` in CI pipeline
- **Dependency pinning**: Lock file ensures reproducible builds

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | ✅        |
| < 1.0   | ❌        |
