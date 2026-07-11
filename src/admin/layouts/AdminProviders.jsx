import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'

// Lazy-loaded from router so public routes never pull auth session machinery.
export default function AdminProviders() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
