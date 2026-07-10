import { useEffect, useRef, useState } from 'react'

/**
 * Avoid loader flash:
 * - wait `delayMs` before showing (fast loads stay blank)
 * - once shown, keep visible at least `minMs` (no blink off)
 */
export function useDeferredLoading(loading, { delayMs = 200, minMs = 400 } = {}) {
  const [show, setShow] = useState(false)
  const shownAtRef = useRef(0)

  useEffect(() => {
    let delayTimer
    let hideTimer

    if (loading) {
      if (show) return undefined

      delayTimer = window.setTimeout(() => {
        shownAtRef.current = Date.now()
        setShow(true)
      }, delayMs)

      return () => window.clearTimeout(delayTimer)
    }

    if (!show) return undefined

    const remaining = Math.max(0, minMs - (Date.now() - shownAtRef.current))
    hideTimer = window.setTimeout(() => {
      shownAtRef.current = 0
      setShow(false)
    }, remaining)

    return () => window.clearTimeout(hideTimer)
  }, [loading, delayMs, minMs, show])

  return show
}
