import { memo } from 'react';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';
import { MessageSquare, Inbox, MapPin, Globe, Clock } from 'lucide-react';

/**
 * Live feed of anonymized fan queries for ops visibility.
 * Shows recent queries with language, intent, and zone information.
 * @param {{ queries: Array<{ id: string, language: string, intentCategory: string, zone: string|null, queryPreview: string, timestamp: number }> }} props
 * @returns {JSX.Element}
 */
const FanQueryFeed = memo(function FanQueryFeed({ queries }) {
  return (
    <section className="ops-card query-feed-card glass-card" aria-label="Fan query feed">
      <div className="ops-card-header">
        <div className="flex-align" style={{ gap: '0.5rem' }}>
          <MessageSquare size={18} className="text-gold" />
          <h3 className="ops-card-title">Live Multilingual Concierge Feed</h3>
        </div>
        <span className="ops-card-count">{queries.length} queries logged</span>
      </div>

      {queries.length === 0 ? (
        <div className="query-feed-empty">
          <Inbox size={36} className="text-cyan opacity-40" style={{ margin: '0 auto 0.8rem' }} />
          <p>No fan queries logged yet. Switch to Fan Concierge and ask a stadium question!</p>
        </div>
      ) : (
        <div className="query-feed-list" role="log" aria-live="polite" aria-label="Recent fan queries">
          {queries.slice(0, 20).map((q) => {
            const langInfo = SUPPORTED_LANGUAGES[q.language] || SUPPORTED_LANGUAGES.en;
            const timeAgo = getTimeAgo(q.timestamp);

            return (
              <article key={q.id} className="query-feed-item" aria-label={`Fan query: ${q.queryPreview}`}>
                <div className="query-feed-meta">
                  <span className="query-lang-badge flex-align" title={langInfo.name} style={{ gap: '0.2rem' }}>
                    <Globe size={12} className="text-cyan" />
                    {langInfo.nativeName}
                  </span>
                  <span className="query-intent-badge">{q.intentCategory}</span>
                  {q.zone && (
                    <span className="query-zone-badge flex-align" style={{ gap: '0.2rem' }}>
                      <MapPin size={11} className="text-gold" />
                      {q.zone.replace(/-/g, ' ')}
                    </span>
                  )}
                  <span className="query-time flex-align" style={{ gap: '0.2rem' }}>
                    <Clock size={11} /> {timeAgo}
                  </span>
                </div>
                <p className="query-preview">{q.queryPreview}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
});

/**
 * Formats a timestamp into a relative time string.
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} Relative time (e.g., "2m ago")
 */
function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default FanQueryFeed;
