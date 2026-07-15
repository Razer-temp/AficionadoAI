import { useState, useCallback } from 'react';
import { generateBriefing } from '../../services/geminiBriefing';
import { formatErrorResponse } from '../../utils/errors';
import LoadingSpinner from '../shared/LoadingSpinner';
import { Bot, AlertTriangle, ClipboardList, Sparkles, ShieldCheck, Clock } from 'lucide-react';

/**
 * AI Operational Briefing Panel.
 * The centerpiece of the ops dashboard — displays Gemini-generated
 * operational briefings synthesized from crowd + query + weather data.
 * @param {{ crowdSnapshot: object, fanQueries: Array, weatherSnapshot?: object }} props
 * @returns {JSX.Element}
 */
function BriefingPanel({ crowdSnapshot, fanQueries, weatherSnapshot = null }) {
  const [briefing, setBriefing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  /** Generates a new operational briefing from current data */
  const handleGenerate = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateBriefing(crowdSnapshot, fanQueries, weatherSnapshot);

      if (result.success) {
        setBriefing(result.data.briefing);
        setLastGenerated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      const formatted = formatErrorResponse(err);
      setError(formatted.error.message);
    } finally {
      setIsLoading(false);
    }
  }, [crowdSnapshot, fanQueries, weatherSnapshot, isLoading]);

  return (
    <section className="ops-card briefing-card glass-card" aria-label="AI operational briefing">
      <div className="ops-card-header">
        <div className="flex-align" style={{ gap: '0.5rem' }}>
          <Bot size={20} className="text-cyan pulse-icon" />
          <h3 className="ops-card-title">Gemini Tactical Dispatch Briefing</h3>
        </div>
        <div className="briefing-actions">
          {lastGenerated && (
            <span className="briefing-timestamp flex-align" style={{ gap: '0.3rem' }}>
              <Clock size={12} /> Updated: {lastGenerated}
            </span>
          )}
          <button
            className="briefing-generate-btn flex-align"
            onClick={handleGenerate}
            disabled={isLoading}
            aria-label="Generate new operational briefing"
            id="generate-briefing-btn"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" label="Generating briefing" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-emerald" />
                <span>Generate Dispatch Orders</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="briefing-content">
        {error && (
          <div className="briefing-error flex-align" role="alert" style={{ gap: '0.5rem' }}>
            <AlertTriangle size={18} className="text-orange" />
            <span>{error}</span>
          </div>
        )}

        {!briefing && !isLoading && !error && (
          <div className="briefing-empty">
            <ClipboardList size={40} className="text-cyan opacity-50" style={{ margin: '0 auto 1rem' }} />
            <p>Click <strong>Generate Dispatch Orders</strong> to synthesize 3D Digital Twin & fan query patterns into AI recommendations.</p>
            <p className="briefing-empty-hint">
              Powered by Gemini 2.5 Flash reasoning over MetLife transit corridors, crowd Lidar spikes, and multi-lingual concierge trends.
            </p>
          </div>
        )}

        {isLoading && !briefing && (
          <div className="briefing-loading">
            <LoadingSpinner size="lg" label="Generating operational briefing" />
            <p>Gemini is synthesizing real-time Lidar & concierge data streams...</p>
          </div>
        )}

        {briefing && (
          <div
            className="briefing-text"
            dangerouslySetInnerHTML={{ __html: formatBriefing(briefing) }}
            aria-live="polite"
          />
        )}
      </div>

      <div className="briefing-footer">
        <span className="briefing-disclaimer flex-align" style={{ gap: '0.4rem' }}>
          <ShieldCheck size={14} className="text-emerald" /> Powered by Google Gemini 2.5 Flash • MetLife NYNJ 2026 Telemetry
        </span>
      </div>
    </section>
  );
}

/**
 * Formats briefing markdown to HTML for display.
 * @param {string} text - Raw briefing text
 * @returns {string} Formatted HTML
 */
function formatBriefing(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4 class="briefing-heading-4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="briefing-heading-3">$1</h3>')
    .replace(/^\s*(\d+)\.\s+(.+)$/gm, '<li class="briefing-numbered"><strong>$1.</strong> $2</li>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

export default BriefingPanel;
