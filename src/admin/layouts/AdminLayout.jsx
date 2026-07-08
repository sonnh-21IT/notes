import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { ExternalLink, FileText, LogOut, Menu, Settings, StickyNote, X } from 'lucide-react'
import AdminToastProvider from '@/admin/components/AdminToast'
import { useAuthState } from '@/context/AuthProvider'
import ThemeToggle from '@/ui/ThemeToggle'

const navItems = [
  { to: '/admin/settings', label: 'Site', icon: Settings },
  { to: '/admin/content', label: 'Content', icon: FileText },
  { to: '/admin/notes', label: 'Notes', icon: StickyNote },
]

function AdminLayout() {
  const { signOut } = useAuthState()
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  function toggleMenu() {
    setMenuOpen((open) => !open)
  }

  function handleSignOut() {
    closeMenu()
    signOut()
  }

  return (
    <AdminToastProvider>
      <div className={`admin-shell${menuOpen ? ' admin-shell--menu-open' : ''}`}>
      <aside className="admin-sidebar">
        <header className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-mark" aria-hidden="true" />
            <span className="admin-sidebar-brand-text">
              <span className="admin-sidebar-brand-title">Portfolio</span>
              <span className="admin-sidebar-brand-sub">Admin</span>
            </span>
          </div>
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar-panel"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </header>

        <div id="admin-sidebar-panel" className="admin-sidebar-panel">
          <nav className="admin-sidebar-nav" aria-label="Admin navigation">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
                end={to === '/admin/settings'}
                onClick={closeMenu}
              >
                <span className="admin-sidebar-link-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="admin-sidebar-text">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-theme">
              <ThemeToggle />
            </div>
            <Link className="admin-sidebar-link admin-sidebar-link--muted" to="/about" onClick={closeMenu}>
              <span className="admin-sidebar-link-icon" aria-hidden="true">
                <ExternalLink size={18} strokeWidth={2} />
              </span>
              <span className="admin-sidebar-text">View site</span>
            </Link>
            <button type="button" className="admin-sidebar-link admin-sidebar-link--muted" onClick={handleSignOut}>
              <span className="admin-sidebar-link-icon" aria-hidden="true">
                <LogOut size={18} strokeWidth={2} />
              </span>
              <span className="admin-sidebar-text">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
      </div>
    </AdminToastProvider>
  )
}

export default AdminLayout
