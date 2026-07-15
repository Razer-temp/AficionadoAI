/**
 * Supabase client initialization.
 * Provides the configured Supabase client for database operations.
 * In the current demo, this is used to demonstrate the architecture;
 * fan query logging and ops data feed use local state for reliability.
 * @module supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Configured Supabase client instance.
 * Uses the anon key for RLS-enforced access.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Logs an anonymized fan query to Supabase.
 * No PII is stored — only language, intent category, and generalized zone.
 * @param {object} queryData - Anonymized query data
 * @param {string} queryData.language - Detected language code
 * @param {string} queryData.intentCategory - Classified intent
 * @param {string} queryData.zone - Generalized zone reference (if any)
 * @param {string} queryData.queryPreview - First 50 chars of sanitized query
 * @returns {Promise<{success: boolean}>}
 */
export async function logFanQueryToSupabase(queryData) {
  if (!supabase) return { success: false };

  try {
    const { error } = await supabase
      .from('fan_queries')
      .insert({
        language: queryData.language,
        intent_category: queryData.intentCategory,
        zone: queryData.zone || null,
        query_preview: queryData.queryPreview,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[Supabase] Fan query log failed:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch (err) {
    console.warn('[Supabase] Fan query log failed:', err.message);
    return { success: false };
  }
}
