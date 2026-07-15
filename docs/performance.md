# Performance

Documentation of performance optimizations in Aficionado AI.

---

## Route-Level Code Splitting

Each persona page is lazily loaded via `React.lazy()` + `Suspense`, so the
initial route ships only the code needed for the current page:

```jsx
const FanLayout = lazy(() => import('./components/fan/FanLayout'));
const OpsLayout = lazy(() => import('./components/ops/OpsLayout'));
const OrganizerDashboard = lazy(() => import('./components/organizer/OrganizerDashboard'));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
```

**Result**: The initial route loads ~80 kB gzip of JavaScript. Secondary routes
are fetched on demand.

---

## Caching Strategy

### LRU Query Cache

- **Where**: `src/utils/cache.js`
- **Configuration**: 50 entries max, 5-minute TTL
- **Hit rate**: Common questions ("What time do gates open?") are cached after
  the first occurrence, avoiding redundant Gemini API calls.
- **Key normalization**: Queries are lowercased, whitespace-collapsed, and
  punctuation-stripped, then prefixed with the detected language code. This
  means "Where is Gate A?" and "where is gate a??" map to the same cache entry.

### Cache Bypass

Cache is bypassed for:

- Crowd-related queries (data changes frequently)
- First-time queries in any language variant

---

## API Efficiency

### Gemini Configuration

| Parameter         | Value              | Rationale                                  |
| ----------------- | ------------------ | ------------------------------------------ |
| `model`           | `gemini-2.5-flash` | Fastest Gemini model, lowest latency       |
| `maxOutputTokens` | 1024               | Caps response length for cost and UI fit   |
| `temperature`     | 0.7                | Balanced creativity vs. grounding accuracy |
| `topP`            | 0.95               | Diverse but focused responses              |

### Knowledge Base Retrieval

- Intent classification uses pre-compiled regex patterns (no runtime compilation).
- Context retrieval extracts only the relevant sections from the JSON knowledge
  base — the full dataset is never sent to Gemini.
- Average context size: ~500 tokens (vs. ~4,000 for the full dataset).

---

## Font Loading

- Google Fonts (`Inter`, `Outfit`) are loaded with `rel="preconnect"` to
  eliminate DNS lookup latency.
- `font-display: swap` ensures text is visible immediately with a fallback font.

---

## Build Optimization

Vite production build includes:

- **Tree shaking**: Unused exports removed
- **Minification**: Terser for JavaScript, CSS minification
- **Source maps**: Enabled for debugging (can be disabled in production)
- **Chunk splitting**: Vendor code separated from application code

---

## Measured Performance

| Metric                     | Value     |
| -------------------------- | --------- |
| Initial bundle (gzip)      | ~80 kB    |
| Fan chat response (cached) | < 50ms    |
| Fan chat response (Gemini) | ~1.5–2.5s |
| Ops briefing generation    | ~2–3s     |
| LRU cache lookup           | < 1ms     |
| Rate limiter check         | < 1ms     |
