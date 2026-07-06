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
          <p className="admin-auth-subtitle">Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <aside className="admin-sidebar admin-sidebar--loading" aria-hidden="true" />
        <main className="admin-main">
          <PageLoading label="Checking session" />
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
