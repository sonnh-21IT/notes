import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '@/ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/about', label: 'About' },
  { to: '/notes', label: 'Notes' },
]

function MainNavigation({ open, onNavigate }) {
  return (
    <nav
      id="site-nav"
      className={`site-nav${open ? ' is-open' : ''}`}
      aria-label="Primary navigation"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      <ThemeToggle />
    </nav>
  )
}

function SiteHeader({ title, tagline }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-top">
          <div className="site-brand">
            <span className="site-logo">{title || 'Ryan'}</span>
            {tagline && <span className="site-tagline">{tagline}</span>}
          </div>
          <button
            type="button"
            className="site-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>
        <MainNavigation open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      </div>
    </header>
  )
}

export default SiteHeader
