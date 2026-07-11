import '@/styles/admin/index.css'
import { Navigate, Outlet } from 'react-router-dom'
import { isSupabaseConfigured } from '@/data/supabase/client'
import PageLoading from '@/ui/PageLoading'
import { useAuthState } from '@/context/AuthProvider'

function AdminRoute() {
  const { session, loading } = useAuthState()

  if (!isSupabaseConfigured()) {
    return (
      <div className="admin-shell admin-shell--centered">
        <div className="admin-auth-card">
          <h1 className="admin-auth-title">Admin unavailable</h1>
          <p className="admin-auth-subtitle">Admin isn&apos;t set up yet. Ask the site owner to finish configuration.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <aside className="admin-sidebar admin-sidebar--loading" aria-hidden="true" />
        <main className="admin-main">
          <PageLoading />
        </main>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export default AdminRoute
