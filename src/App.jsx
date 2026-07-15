import { Routes, Route } from 'react-router-dom';
import { useState, useCallback, lazy, Suspense } from 'react';
import Header from './components/shared/Header';
import ErrorBoundary from './components/shared/ErrorBoundary';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { EventProvider } from './components/gate/EventContext';

/* Route-level code splitting — each persona page is lazily loaded,
   so the initial route ships only the code needed for the current page. */
const FanLayout = lazy(() => import('./components/fan/FanLayout'));
const OpsLayout = lazy(() => import('./components/ops/OpsLayout'));
const EventGate = lazy(() => import('./components/gate/EventGate'));
const OpsGate = lazy(() => import('./components/gate/OpsGate'));
const OrganizerDashboard = lazy(() => import('./components/organizer/OrganizerDashboard'));
const OrganizerAuthGate = lazy(() => import('./components/organizer/OrganizerAuthGate'));
const LandingPage = lazy(() => import('./components/landing/LandingPage'));

/* Lazy-load the auth provider only when needed */
const OrganizerAuthProvider = lazy(() =>
  import('./components/organizer/OrganizerAuthContext').then((m) => ({
    default: m.OrganizerAuthProvider,
  })),
);

/**
 * Root application component.
 * Manages persona state (fan/ops) and routes between views.
 * Supports both direct routes (/fan, /ops) and event-scoped routes (/event/:slug).
 * Fan interactions feed anonymized data into the ops layer.
 * @returns {JSX.Element} The application root
 */
function App() {
  const [fanQueries, setFanQueries] = useState([]);

  /** @param {object} query - Anonymized fan query to log */
  const logFanQuery = useCallback((query) => {
    setFanQueries((prev) =>
      [{ ...query, timestamp: Date.now(), id: crypto.randomUUID() }, ...prev].slice(0, 200),
    );
  }, []);

  return (
    <ErrorBoundary>
      <EventProvider>
        {/* Skip-to-content link for keyboard/screen-reader users (WCAG 2.4.1) */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="app-root">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* ========================================
                  EVENT-SCOPED ROUTES (Gated Access)
                  ======================================== */}

              {/* Fan gate — validates event link, optional claim code */}
              <Route path="/event/:slug" element={<EventGate />} />

              {/* Fan view — scoped to event (after gate pass) */}
              <Route
                path="/event/:slug/fan"
                element={
                  <>
                    <Header persona="fan" />
                    <main id="main-content" role="main">
                      <FanLayout onQueryLog={logFanQuery} />
                    </main>
                  </>
                }
              />

              {/* Ops view — scoped to event (validates ops access key) */}
              <Route
                path="/event/:slug/ops"
                element={
                  <OpsGate>
                    <Header persona="ops" />
                    <main id="main-content" role="main">
                      <OpsLayout fanQueries={fanQueries} />
                    </main>
                  </OpsGate>
                }
              />

              {/* ========================================
                  ORGANIZER DASHBOARD
                  ======================================== */}
              <Route
                path="/organizer"
                element={
                  <OrganizerAuthProvider>
                    <OrganizerAuthGate>
                      <Header persona="organizer" />
                      <main id="main-content" role="main">
                        <OrganizerDashboard />
                      </main>
                    </OrganizerAuthGate>
                  </OrganizerAuthProvider>
                }
              />

              {/* ========================================
                  DIRECT ROUTES (Backward Compatibility)
                  ======================================== */}
              <Route
                path="/fan"
                element={
                  <>
                    <Header persona="fan" />
                    <main id="main-content" role="main">
                      <FanLayout onQueryLog={logFanQuery} />
                    </main>
                  </>
                }
              />
              <Route
                path="/ops"
                element={
                  <>
                    <Header persona="ops" />
                    <main id="main-content" role="main">
                      <OpsLayout fanQueries={fanQueries} />
                    </main>
                  </>
                }
              />

              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </Suspense>
        </div>
      </EventProvider>
    </ErrorBoundary>
  );
}

export default App;
