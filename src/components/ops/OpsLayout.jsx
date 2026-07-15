import OpsDashboard from './OpsDashboard';

/**
 * Operations view layout wrapper.
 * @param {{ fanQueries: Array }} props
 * @returns {JSX.Element}
 */
function OpsLayout({ fanQueries }) {
  return (
    <main className="ops-layout" role="main" aria-label="Operations Dashboard">
      <OpsDashboard fanQueries={fanQueries} />
    </main>
  );
}

export default OpsLayout;
