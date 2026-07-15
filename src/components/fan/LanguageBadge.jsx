import { SUPPORTED_LANGUAGES } from '../../utils/constants';
import { Globe } from 'lucide-react';

/**
 * Language detection badge.
 * Shows the detected language of the conversation with flag and native name.
 * @param {{ language: string }} props
 * @returns {JSX.Element}
 */
function LanguageBadge({ language }) {
  const langInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  return (
    <div
      className="language-badge flex-align"
      role="status"
      aria-label={`Conversation language: ${langInfo.name}`}
      title={`Detected language: ${langInfo.name}`}
      style={{ gap: '0.4rem' }}
    >
      <Globe size={14} className="text-cyan" />
      <span className="language-badge-name">{langInfo.nativeName}</span>
    </div>
  );
}

export default LanguageBadge;
