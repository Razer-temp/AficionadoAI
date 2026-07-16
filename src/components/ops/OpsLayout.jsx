import PropTypes from 'prop-types';
import OpsDashboard from './OpsDashboard';

/**
 * Operations view layout wrapper.
 * @param {{ fanQueries: Array }} props
 * @returns {JSX.Element}
 */
function OpsLayout({ fanQueries }) {
  return (
    <div className="ops-layout" aria-label="Operations Dashboard">
      <OpsDashboard fanQueries={fanQueries} />
    </div>
  );
}


OpsLayout.propTypes = {
  fanQueries: PropTypes.array.isRequired,
};

export default OpsLayout;
