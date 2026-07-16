import PropTypes from 'prop-types';
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * React error boundary.
 * Catches render errors in child components and displays a fallback UI
 * instead of crashing the entire app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-content glass">
            <AlertTriangle size={42} className="text-orange error-boundary-icon" />
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred. Please refresh the page to try again.</p>
            <button
              className="error-boundary-btn flex-align error-boundary-btn-flex"
              onClick={() => window.location.reload()}
              aria-label="Reload the page"
            >
              <RefreshCw size={16} />
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
