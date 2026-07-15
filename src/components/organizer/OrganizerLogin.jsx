/**
 * OrganizerLogin — Premium authentication interface for organizers.
 * Supports sign-in, account creation, and quick demo login.
 * @module OrganizerLogin
 */

import { useState } from 'react';
import { useOrganizerAuth } from './OrganizerAuthContext';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import '../../styles/organizer.css';

export default function OrganizerLogin() {
  const { login, signup } = useOrganizerAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const res = await signup(email, password);
        if (res.success) {
          if (!res.data?.session) {
            setMessage('Account created! Please check your email to verify or sign in.');
            setIsSignUp(false);
          }
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    const demoEmail = 'organizer@aficionado.ai';
    const demoPassword = 'fifa2026opsPassword!#';

    // First try logging in
    let res = await login(demoEmail, demoPassword);
    if (!res.success) {
      // If user not found, create demo user and log in
      await signup(demoEmail, demoPassword);
      res = await login(demoEmail, demoPassword);
      if (!res.success) {
        setError('Demo login failed. Please sign up above with your own email.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="organizer-auth-container">
      <div className="organizer-auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Shield className="w-8 h-8 text-gold-400 animate-pulse" />
          </div>
          <h1 className="auth-title">
            {isSignUp ? 'Create Organizer Account' : 'Organizer Portal Login'}
          </h1>
          <p className="auth-subtitle">
            Secure multi-tenant command center for World Cup 2026 event managers
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(false);
              setError(null);
              setMessage(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isSignUp ? 'active' : ''}`}
            onClick={() => {
              setIsSignUp(true);
              setError(null);
              setMessage(null);
            }}
          >
            Register Event
          </button>
        </div>

        {/* Error / Message Alerts */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="auth-alert success">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="auth-email">Work Email</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="organizer@stadium.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Box */}
        <div className="auth-divider">
          <span>OR INSTANT DEMO ACCESS</span>
        </div>

        <button
          type="button"
          className="demo-login-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          <Sparkles className="w-5 h-5 text-gold-400" />
          <div className="demo-btn-text">
            <span className="demo-title">Launch Demo Organizer Session</span>
            <span className="demo-desc">Auto-logs into preconfigured sandbox tenant</span>
          </div>
          <KeyRound className="w-5 h-5 opacity-70" />
        </button>

        {/* Footer Security Notice */}
        <div className="auth-footer-notice">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>RLS-Protected: Only your authorized events and fan analytics are accessible.</span>
        </div>
      </div>
    </div>
  );
}
