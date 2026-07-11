import { useEffect, useState } from 'react'

/**
 * Stacks skeleton + content; crossfades when `pending` becomes false.
 * Content should already be mountable (painted under the skeleton).
 */
function RevealGate({ pending, skeleton, children, busy = false }) {
  const [renderSkeleton, setRenderSkeleton] = useState(Boolean(skeleton) && pending)

  if (pending && skeleton && !renderSkeleton) {
    setRenderSkeleton(true)
  }

  useEffect(() => {
    if (pending || !renderSkeleton) return undefined

    // Fallback when transitionend doesn't fire (reduced motion / skipped).
    const timer = window.setTimeout(() => setRenderSkeleton(false), 400)
    return () => window.clearTimeout(timer)
  }, [pending, renderSkeleton])

  if (!skeleton) {
    if (pending) return null
    return children
  }

  const ready = !pending

  return (
    <div className={`page-load-state${ready ? ' page-load-state--ready' : ''}`}>
      {renderSkeleton ? (
        <div
          className="page-skeleton-host"
          aria-busy={!ready || undefined}
          aria-live="polite"
          onTransitionEnd={(event) => {
            if (event.propertyName !== 'opacity') return
            if (event.target !== event.currentTarget) return
            if (ready) setRenderSkeleton(false)
          }}
        >
          <span className="visually-hidden">Loading</span>
          {skeleton}
        </div>
      ) : null}

      {children != null ? (
        <div
          className="page-load-content"
          aria-hidden={!ready || undefined}
          aria-busy={busy || undefined}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default RevealGate
