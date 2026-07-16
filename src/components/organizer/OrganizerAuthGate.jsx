/**
 * OrganizerAuthGate — Guards access to the organizer dashboard.
 * Requires an active Supabase Auth session, otherwise renders OrganizerLogin.
 * @module OrganizerAuthGate
 */

import { useOrganizerAuth } from './OrganizerAuthContext';
import OrganizerLogin from './OrganizerLogin';
import { Loader2, LogOut, Shield } from 'lucide-react';
import '../../styles/organizer.css';

export default function OrganizerAuthGate({ children }) {
  const { user, loading, logout } = useOrganizerAuth();

  if (loading) {
    return (
      <div className="organizer-loading-gate" role="status">
        <Loader2 className="w-10 h-10 text-gold-400 animate-spin" aria-hidden="true" />
        <span>Verifying Organizer Credentials & RLS Permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <OrganizerLogin />;
  }

  return (
    <div className="organizer-protected-wrapper">
      {/* Top Banner showing current logged in organizer */}
      <div className="organizer-user-bar">
        <div className="user-bar-left">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="user-bar-label">Authenticated Tenant:</span>
          <span className="user-bar-email">{user.email}</span>
        </div>
        <button
          onClick={() => logout()}
          className="user-bar-logout"
          title="Sign Out of Organizer Dashboard"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Tenant</span>
        </button>
      </div>

      {/* Render child dashboard */}
      {children}
    </div>
  );
}
