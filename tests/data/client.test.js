import { describe, expect, it } from 'vitest'
import { ADMIN_SESSION_MAX_MS, isAdminSessionExpired } from '@/data/supabase/client'

describe('isAdminSessionExpired', () => {
  it('is false without a session start', () => {
    expect(isAdminSessionExpired(null)).toBe(false)
    expect(isAdminSessionExpired({})).toBe(false)
  })

  it('is false for a fresh sign-in', () => {
    expect(isAdminSessionExpired({
      user: { last_sign_in_at: new Date().toISOString() },
    })).toBe(false)
  })

  it('is true past the admin session cap', () => {
    const started = new Date(Date.now() - ADMIN_SESSION_MAX_MS - 1000).toISOString()
    expect(isAdminSessionExpired({
      user: { last_sign_in_at: started },
    })).toBe(true)
  })
})
