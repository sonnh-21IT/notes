import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import SiteBrand from '@/ui/SiteBrand'
import ThemeToggle from '@/ui/ThemeToggle'
import { prefetchRoute } from '@/utils/prefetchRoute'

const NAV_ITEMS = [
  { to: '/about', label: 'About', prefetch: () => prefetchRoute(() => import('@/pages/about/AboutPage')) },
  { to: '/notes', label: 'Notes', prefetch: () => prefetchRoute(() => import('@/pages/notes/NotesPage')) },
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
          onMouseEnter={item.prefetch}
          onFocus={item.prefetch}
        >
          {item.label}
        </NavLink>
      ))}
      <ThemeToggle />
    </nav>
  )
}

function SiteHeaderInner({ title, tagline, loading = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-header-top">
          <SiteBrand title={title} tagline={tagline} loading={loading} />
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
        <MainNavigation open={menuOpen} onNavigate={closeMenu} />
      </div>
    </header>
  )
}

function SiteHeader(props) {
  const { pathname } = useLocation()
  return <SiteHeaderInner key={pathname} {...props} />
}

export default SiteHeader
