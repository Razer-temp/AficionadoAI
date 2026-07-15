import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { MessageSquare, Activity, ShieldCheck, Sparkles, Radio, Settings } from 'lucide-react';
import { useEvent } from '../gate/EventContext';

/**
 * Application header with persona toggle (Fan / Ops / Organizer).
 * Event-aware: shows event name when inside an event-scoped route.
 * @param {{ persona: 'fan' | 'ops' | 'organizer' }} props
 * @returns {JSX.Element}
 */
function Header({ persona }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams() || {};
  const { event } = useEvent();

  // Determine if we're in an event-scoped route
  const isEventScoped = location.pathname.startsWith('/event/');
  const basePath = isEventScoped ? `/event/${slug}` : '';

  const fanPath = `${basePath}/fan`;
  const opsPath = `${basePath}/ops`;

  const isFan = location.pathname.endsWith('/fan');
  const isOps = location.pathname.endsWith('/ops');
  const isOrganizer = location.pathname.startsWith('/organizer');

  // Subtitle text
  const subtitleText =
    isEventScoped && event
      ? `${event.venue} \u2022 ${event.name}`
      : 'FIFA World Cup 2026 \u2022 MetLife Intelligent Command Center';

  return (
    <header className="app-header glass-strong" role="banner">
      <div className="header-content">
        <button
          type="button"
          className="header-brand"
          onClick={() => navigate(isEventScoped ? fanPath : '/')}
          style={{
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            padding: 0,
            textAlign: 'left',
          }}
        >
          <div className="header-logo-wrapper">
            <img src="/logo.svg" alt="Aficionado AI Logo" className="header-logo-img" />
          </div>
          <div className="header-titles">
            <h1 className="header-title">
              <span className="gradient-text">Aficionado</span> AI
            </h1>
            <span
              className="header-subtitle flex-align"
              style={{ gap: '0.35rem', marginTop: '2px' }}
            >
              <Radio className="pulse-icon text-emerald" size={12} />
              <span>{subtitleText}</span>
            </span>
          </div>
        </button>

        <nav className="header-nav" role="navigation" aria-label="View selector">
          <button
            className={`nav-btn ${isFan ? 'nav-btn--active nav-btn--fan' : ''}`}
            onClick={() => navigate(isEventScoped ? fanPath : '/fan')}
            aria-current={isFan ? 'page' : undefined}
            aria-label="Switch to Fan View"
            id="nav-fan-btn"
          >
            <MessageSquare className="nav-btn-icon" size={17} />
            <span className="nav-btn-label">Fan Concierge</span>
          </button>
          <button
            className={`nav-btn ${isOps ? 'nav-btn--active nav-btn--ops' : ''}`}
            onClick={() => {
              if (isEventScoped) {
                navigate(opsPath);
              } else {
                navigate('/ops');
              }
            }}
            aria-current={isOps ? 'page' : undefined}
            aria-label="Switch to Operations Dashboard"
            id="nav-ops-btn"
          >
            <Activity className="nav-btn-icon" size={17} />
            <span className="nav-btn-label">Ops Command</span>
          </button>
          <button
            className={`nav-btn ${isOrganizer ? 'nav-btn--active nav-btn--organizer' : ''}`}
            onClick={() => navigate('/organizer')}
            aria-current={isOrganizer ? 'page' : undefined}
            aria-label="Switch to Organizer Dashboard"
            id="nav-organizer-btn"
          >
            <Settings className="nav-btn-icon" size={17} />
            <span className="nav-btn-label">Organizer Hub</span>
          </button>
        </nav>

        <div className="header-badge">
          <div
            className={`persona-badge ${
              persona === 'ops'
                ? 'persona-badge--ops'
                : persona === 'organizer'
                  ? 'persona-badge--organizer'
                  : 'persona-badge--fan'
            }`}
          >
            {persona === 'ops' ? (
              <>
                <div className="badge-icon-wrap badge-icon-wrap--ops">
                  <ShieldCheck size={15} />
                </div>
                <span className="badge-text">Lenovo AI Command Hub</span>
                <span className="badge-live-dot badge-live-dot--ops" title="System Active" />
              </>
            ) : persona === 'organizer' ? (
              <>
                <div className="badge-icon-wrap badge-icon-wrap--organizer">
                  <Settings size={15} />
                </div>
                <span className="badge-text">Event Command Center</span>
                <span className="badge-live-dot badge-live-dot--organizer" title="System Active" />
              </>
            ) : (
              <>
                <div className="badge-icon-wrap badge-icon-wrap--fan">
                  <Sparkles size={15} />
                </div>
                <span className="badge-text">5G AR Concierge</span>
                <span className="badge-live-dot badge-live-dot--fan" title="Active 5G Telemetry" />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
