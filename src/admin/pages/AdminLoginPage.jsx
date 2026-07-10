import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/data/supabase/client'
import PageLoading from '@/ui/PageLoading'
import AdminFlash from '@/admin/components/AdminFlash'
import { useAuthState } from '@/context/AuthProvider'

function AdminLoginPage() {
  const { session, signIn, loading } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isSupabaseConfigured()) {
    return (
      <div className="admin-shell admin-shell--centered">
        <div className="admin-auth-card">
          <h1 className="admin-auth-title">Admin unavailable</h1>
          <p className="admin-auth-subtitle">Admin isn&apos;t set up yet. Ask the site owner to finish configuration.</p>
          <Link className="admin-text-link" to="/about">Back to site</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-shell admin-shell--centered">
        <PageLoading />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-shell admin-shell--centered">
      <div className="admin-auth-card">
        <h1 className="admin-auth-title">Sign in</h1>
        <p className="admin-auth-subtitle">Sign in with your admin email and password.</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-field">
            <span className="admin-label">Email</span>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">Password</span>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <AdminFlash type="error">{error}</AdminFlash>

          <button type="submit" className="admin-button admin-button--primary admin-button--block" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link className="admin-text-link" to="/about">Back to site</Link>
      </div>
    </div>
  )
}

export default AdminLoginPage
