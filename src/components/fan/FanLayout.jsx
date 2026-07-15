import FanChat from './FanChat';

/**
 * Fan view layout wrapper.
 * Provides the mobile-first layout structure for the fan chat experience.
 * @param {{ onQueryLog: Function }} props
 * @returns {JSX.Element}
 */
function FanLayout({ onQueryLog }) {
  return (
    <main className="fan-layout" role="main" aria-label="Fan Chat Interface">
      <FanChat onQueryLog={onQueryLog} />
    </main>
  );
}

export default FanLayout;
