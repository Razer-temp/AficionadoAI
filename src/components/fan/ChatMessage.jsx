import PropTypes from 'prop-types';
import { memo } from 'react';
import { User, Bot, Zap, FileText } from 'lucide-react';

/**
 * Individual chat message bubble.
 * Visually differentiates user messages from assistant responses.
 * @param {{ message: { role: string, text: string, language?: string, sources?: string[], cached?: boolean }, index: number }} props
 * @returns {JSX.Element}
 */
const ChatMessage = memo(function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <article
      className={`chat-message chat-message--${message.role}`}
      aria-label={`${isUser ? 'Your message' : 'Assistant response'}`}
      style={{ '--anim-delay': `${Math.min(index * 0.05, 0.3)}s` }}
    >
      <div className="chat-message-avatar flex-center" aria-hidden="true">
        {isUser ? (
          <User size={18} className="text-cyan" />
        ) : (
          <Bot size={18} className="text-emerald" />
        )}
      </div>
      <div className="chat-message-content">
        <div className="chat-message-header">
          <span className="chat-message-sender">{isUser ? 'You' : 'Aficionado AI'}</span>
          {message.cached && (
            <span className="chat-message-cached flex-align">
              <Zap size={12} className="text-gold" /> Cached
            </span>
          )}
        </div>
        <div
          className="chat-message-text"
          lang={isAssistant && message.language ? message.language : undefined}
          dir={isAssistant ? 'auto' : undefined}
          dangerouslySetInnerHTML={{
            __html: isAssistant ? formatMarkdown(message.text) : escapeHtml(message.text),
          }}
        />
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="chat-message-sources flex-align chat-sources-container">
            <span className="sources-label flex-align chat-sources-label">
              <FileText size={13} className="text-cyan" /> Sources:
            </span>
            {message.sources.map((s, i) => (
              <span key={i} className="source-tag">
                {s.replace('venue-', '')}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
});

/**
 * Escapes HTML characters in user input for safe display.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Converts basic markdown to HTML for assistant responses.
 * Handles bold, bullets, and line breaks.
 * @param {string} text - Markdown text
 * @returns {string} HTML string
 */
function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}


ChatMessage.propTypes = {
  message: PropTypes.shape({
    role: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    language: PropTypes.string,
    sources: PropTypes.arrayOf(PropTypes.string),
    cached: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default ChatMessage;
