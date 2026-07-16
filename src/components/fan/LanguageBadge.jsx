import PropTypes from 'prop-types';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

/**
 * Language detection badge.
 * Shows the detected language of the conversation with flag and native name.
 * Interactive and focusable for screen readers (WCAG AA compliant).
 * @param {{ language: string }} props
 * @returns {JSX.Element}
 */
function LanguageBadge({ language }) {
  const langInfo = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.en;

  return (
    <button
      type="button"
      onClick={() => alert(`Conversation detected in language: ${langInfo.name}. Auto-translated via Gemini AI.`)}
      aria-label={`Conversation detected in language: ${langInfo.name}. Click for translation info.`}
      title={`Detected language: ${langInfo.name} (Click for accessibility info)`}
      className={`language-badge flex-align lang-badge-flex ${language !== 'en' ? 'language-badge--active' : ''}`}
    >
      <span className="language-badge-flag" aria-hidden="true">
        {langInfo.flag}
      </span>
      <span className="language-badge-name">{langInfo.nativeName}</span>
    </button>
  );
}

LanguageBadge.propTypes = {
  language: PropTypes.string.isRequired,
};

export default LanguageBadge;
