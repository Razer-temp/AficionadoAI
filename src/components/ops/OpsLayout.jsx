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

export default OpsLayout;
