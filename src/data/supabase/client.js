import { createClient } from '@supabase/supabase-js'

let client = null

/** Absolute admin session cap from last sign-in (refresh cannot extend past this). */
export const ADMIN_SESSION_MAX_MS = 8 * 60 * 60 * 1000

function clearLegacyLocalAuth() {
  // ponytail: one-time migration off long-lived localStorage sessions
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('sb-') && key.includes('auth-token')) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // ignore private-mode / blocked storage
  }
}

export function getSupabaseClient() {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Site data isn\'t configured.')
  }

  clearLegacyLocalAuth()

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof sessionStorage === 'undefined' ? undefined : sessionStorage,
    },
  })
  return client
}

export function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export function isAdminSessionExpired(session) {
  const startedAt = session?.user?.last_sign_in_at
  if (!startedAt) return false
  const started = Date.parse(startedAt)
  if (Number.isNaN(started)) return false
  return Date.now() - started > ADMIN_SESSION_MAX_MS
}
