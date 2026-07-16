import PropTypes from 'prop-types';
import FanChat from './FanChat';

/**
 * Fan view layout wrapper.
 * Provides the mobile-first layout structure for the fan chat experience.
 * @param {{ onQueryLog: Function }} props
 * @returns {JSX.Element}
 */
function FanLayout({ onQueryLog }) {
  return (
    <div className="fan-layout" aria-label="Fan Chat Interface">
      <FanChat onQueryLog={onQueryLog} />
    </div>
  );
}


FanLayout.propTypes = {
  onQueryLog: PropTypes.func,
};

export default FanLayout;
