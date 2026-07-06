import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function scrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: scrollBehavior(),
    })
  }, [pathname])

  return null
}

export default ScrollToTop
