import { createClient } from '@supabase/supabase-js'

const rawUrl          = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!rawUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

// Strip any accidental trailing path (e.g. /rest/v1/) — client appends its own paths
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession  : true,
    autoRefreshToken: true,
    storageKey      : 'mq-admin-session',
  },
})
