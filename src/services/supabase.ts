import { createClient } from '@supabase/supabase-js'

/**
 * Supabase-Konfiguration.
 * Achtung: Nur PUBLISHABLE-Keys (früher: anon `eyJ...`) gehören ins Frontend —
 * ein `sb_secret_...`-Key umgeht RLS und darf NIE im Browser landen.
 * Werte kommen aus .env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY);
 * die Fallbacks unten sind der öffentliche Publishable-Key des Projekts.
 */
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://yjfoxqwgvutzsxjvqwgx.supabase.co'
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lI5JnfKB3naAxa-qUeeyCA_HTT6Qj3q'

const looksConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl.includes('.supabase.') &&
  Boolean(supabaseKey) &&
  supabaseKey.startsWith('sb_publishable_') // nur Publishable-Keys zulassen

export const isSupabaseConfigured = looksConfigured

if (!isSupabaseConfigured) {
  console.warn(
    '[TECSPAZE] Kein gültiger Supabase-Publishable-Key gefunden – die App läuft im Offline-Modus (IndexedDB).'
  )
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }
export default supabase
