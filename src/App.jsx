import { Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Header from './components/shared/Header';
import FanLayout from './components/fan/FanLayout';
import OpsLayout from './components/ops/OpsLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import EventGate from './components/gate/EventGate';
import OpsGate from './components/gate/OpsGate';
import { EventProvider } from './components/gate/EventContext';
import OrganizerDashboard from './components/organizer/OrganizerDashboard';
import { OrganizerAuthProvider } from './components/organizer/OrganizerAuthContext';
import OrganizerAuthGate from './components/organizer/OrganizerAuthGate';
import LandingPage from './components/landing/LandingPage';

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
    setFanQueries((prev) => [
      { ...query, timestamp: Date.now(), id: crypto.randomUUID() },
      ...prev,
    ].slice(0, 200));
  }, []);

  return (
    <ErrorBoundary>
      <EventProvider>
        <div className="app-root">
          <Routes>
            {/* ========================================
                EVENT-SCOPED ROUTES (Gated Access)
                ======================================== */}

            {/* Fan gate — validates event link, optional claim code */}
            <Route
              path="/event/:slug"
              element={<EventGate />}
            />

            {/* Fan view — scoped to event (after gate pass) */}
            <Route
              path="/event/:slug/fan"
              element={
                <>
                  <Header persona="fan" />
                  <FanLayout onQueryLog={logFanQuery} />
                </>
              }
            />

            {/* Ops view — scoped to event (validates ops access key) */}
            <Route
              path="/event/:slug/ops"
              element={
                <OpsGate>
                  <Header persona="ops" />
                  <OpsLayout fanQueries={fanQueries} />
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
                    <OrganizerDashboard />
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
                  <FanLayout onQueryLog={logFanQuery} />
                </>
              }
            />
            <Route
              path="/ops"
              element={
                <>
                  <Header persona="ops" />
                  <OpsLayout fanQueries={fanQueries} />
                </>
              }
            />

            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </EventProvider>
    </ErrorBoundary>
  );
}

export default App;
