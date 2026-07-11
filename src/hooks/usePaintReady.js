import { useLayoutEffect, useState } from 'react'

/** True after `active` content has had a chance to paint (double rAF). */
export function usePaintReady(active) {
  const [ready, setReady] = useState(false)
  const [seenActive, setSeenActive] = useState(active)

  // Reset immediately when content goes away / identity changes — no effect setState.
  if (seenActive !== active) {
    setSeenActive(active)
    setReady(false)
  }

  useLayoutEffect(() => {
    if (!active) return undefined

    let alive = true
    const outer = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (alive) setReady(true)
      })
    })

    return () => {
      alive = false
      window.cancelAnimationFrame(outer)
    }
  }, [active])

  return active && ready
}
