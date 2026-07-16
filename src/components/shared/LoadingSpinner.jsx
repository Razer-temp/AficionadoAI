import PropTypes from 'prop-types';
/**
 * Accessible loading spinner component.
 * Announces loading state to screen readers via aria-live.
 * @param {{ size?: 'sm' | 'md' | 'lg', label?: string }} props
 * @returns {JSX.Element}
 */
function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizeClass = `spinner--${size}`;

  return (
    <div className={`spinner-container ${sizeClass}`} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true">
        <div className="spinner-ring"></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}


LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
};

export default LoadingSpinner;
