import { supabase } from './supabase';

export async function loginOrganizer(email, password) {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[EventService] loginOrganizer failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function signupOrganizer(email, password) {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[EventService] signupOrganizer failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function logoutOrganizer() {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[EventService] logoutOrganizer failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function getOrganizerSession() {
  if (!supabase) return { success: false, session: null, user: null };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { success: true, session, user: session?.user || null };
  } catch (err) {
    return { success: false, session: null, user: null };
  }
}
