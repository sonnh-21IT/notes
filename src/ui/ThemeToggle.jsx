import { useEffect, useState } from 'react'

function readTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-glyph theme-toggle-glyph-light" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
          </svg>
        </span>
        <span className="theme-toggle-glyph theme-toggle-glyph-dark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.2 15.4a8.5 8.5 0 0 1-11.6-11A9 9 0 1 0 20.2 15.4Z" />
          </svg>
        </span>
        <span className="theme-toggle-knob" aria-hidden="true">
          <span className="theme-toggle-knob-icon theme-toggle-knob-sun">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
            </svg>
          </span>
          <span className="theme-toggle-knob-icon theme-toggle-knob-moon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.2 15.4a8.5 8.5 0 0 1-11.6-11A9 9 0 1 0 20.2 15.4Z" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  )
}

export default ThemeToggle
