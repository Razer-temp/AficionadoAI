/**
 * Animated typing indicator for AI responses.
 * Three bouncing dots showing the assistant is generating a response.
 * @returns {JSX.Element}
 */
function TypingIndicator() {
  return (
    <div className="typing-indicator" role="status" aria-label="Assistant is typing">
      <div className="typing-bubble">
        <span className="typing-dot" aria-hidden="true"></span>
        <span className="typing-dot" aria-hidden="true"></span>
        <span className="typing-dot" aria-hidden="true"></span>
      </div>
      <span className="sr-only">Assistant is thinking...</span>
    </div>
  );
}

export default TypingIndicator;
