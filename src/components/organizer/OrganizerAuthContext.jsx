/* eslint-disable react-refresh/only-export-components */
/**
 * OrganizerAuthContext — Authentication context for organizer portal.
 * Manages Supabase Auth session, login, signup, and logout.
 * @module OrganizerAuthContext
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getOrganizerSession,
  loginOrganizer,
  signupOrganizer,
  logoutOrganizer,
} from '../../services/eventService';
import { supabase } from '../../services/supabase';

const OrganizerAuthContext = createContext(null);

export function OrganizerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    const result = await getOrganizerSession();
    if (result.success && result.session) {
      setSession(result.session);
      setUser(result.user);
    } else {
      setSession(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();

    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshSession]);

  const login = async (email, password) => {
    const result = await loginOrganizer(email, password);
    if (result.success) {
      await refreshSession();
    }
    return result;
  };

  const signup = async (email, password) => {
    const result = await signupOrganizer(email, password);
    if (result.success) {
      await refreshSession();
    }
    return result;
  };

  const logout = async () => {
    const result = await logoutOrganizer();
    if (result.success) {
      setSession(null);
      setUser(null);
    }
    return result;
  };

  return (
    <OrganizerAuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </OrganizerAuthContext.Provider>
  );
}

export function useOrganizerAuth() {
  const context = useContext(OrganizerAuthContext);
  if (!context) {
    throw new Error('useOrganizerAuth must be used within an OrganizerAuthProvider');
  }
  return context;
}
