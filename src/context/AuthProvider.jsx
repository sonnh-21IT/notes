import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getSupabaseClient,
  isAdminSessionExpired,
  isSupabaseConfigured,
} from '@/data/supabase/client'

const AuthContext = createContext(null)

async function enforceSessionLimit(supabase, nextSession, setSession) {
  if (!nextSession) {
    setSession(null)
    return null
  }

  if (isAdminSessionExpired(nextSession)) {
    await supabase.auth.signOut()
    setSession(null)
    return null
  }

  setSession(nextSession)
  return nextSession
}

export function AuthProvider({ children }) {
  const configured = isSupabaseConfigured()
  const { pathname } = useLocation()
  const needsAuth = configured && pathname.startsWith('/admin')
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(!needsAuth)
  const [watchedNeedsAuth, setWatchedNeedsAuth] = useState(needsAuth)

  // React-allowed: reset gate when leaving/entering /admin without an effect setState.
  if (watchedNeedsAuth !== needsAuth) {
    setWatchedNeedsAuth(needsAuth)
    setReady(!needsAuth)
  }

  useEffect(() => {
    if (!needsAuth) return undefined

    const supabase = getSupabaseClient()
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      await enforceSessionLimit(supabase, data.session, setSession)
      if (active) setReady(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      enforceSessionLimit(supabase, nextSession, setSession).finally(() => {
        if (active) setReady(true)
      })
    })

    const timer = window.setInterval(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!active || !data.session) return
        if (isAdminSessionExpired(data.session)) {
          supabase.auth.signOut()
        }
      })
    }, 60_000)

    return () => {
      active = false
      window.clearInterval(timer)
      subscription.subscription.unsubscribe()
    }
  }, [needsAuth])

  const loading = needsAuth && !ready

  const value = useMemo(
    () => ({
      session,
      loading,
      signIn: async (email, password) => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      signOut: async () => {
        const supabase = getSupabaseClient()
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthState() {
  const state = useContext(AuthContext)
  if (!state) {
    throw new Error('useAuthState must be used within AuthProvider')
  }
  return state
}
