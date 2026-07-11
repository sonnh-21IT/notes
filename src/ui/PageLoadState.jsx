import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { usePaintReady } from '@/hooks/usePaintReady'
import RevealGate from '@/ui/RevealGate'

/**
 * Keeps skeleton up until data exists, min display time elapsed, and content has painted.
 * Then crossfades skeleton → content.
 */
function PageLoadState({
  loading = false,
  error = null,
  hasData = false,
  skeleton = null,
  children,
}) {
  const bootstrapping = loading && !hasData
  const holdSkeleton = useDeferredLoading(bootstrapping, { delayMs: 0, minMs: 280 })
  const paintReady = usePaintReady(hasData && !bootstrapping)
  const pending = Boolean(skeleton) && (bootstrapping || holdSkeleton || (hasData && !paintReady))

  if (error && !hasData) {
    return (
      <section className="page-stack content content-error">
        <h1 className="content-title">Couldn&apos;t load this page</h1>
        <p className="content-lead">Please try again in a moment.</p>
      </section>
    )
  }

  if (!skeleton) {
    if (bootstrapping) return null
    return (
      <div className={loading ? 'is-content-validating' : undefined} aria-busy={loading || undefined}>
        {children}
      </div>
    )
  }

  return (
    <RevealGate pending={pending} skeleton={skeleton} busy={loading}>
      {hasData ? children : null}
    </RevealGate>
  )
}

export default PageLoadState
