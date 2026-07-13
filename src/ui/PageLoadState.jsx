import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { usePaintReady } from '@/hooks/usePaintReady'
import ContentError from '@/ui/ContentError'
import RevealGate from '@/ui/RevealGate'

/**
 * Keeps skeleton up until data exists, min display time elapsed, and content has painted.
 * Then crossfades skeleton → content.
 * Pass `ready={false}` to hold the skeleton until an external gate opens (e.g. sibling sections).
 */
function PageLoadState({
  loading = false,
  error = null,
  hasData = false,
  skeleton = null,
  ready = true,
  children,
}) {
  const bootstrapping = loading && !hasData
  const holdSkeleton = useDeferredLoading(bootstrapping, { delayMs: 0, minMs: 280 })
  const paintReady = usePaintReady(hasData && !bootstrapping)
  const pending = Boolean(skeleton) && (
    bootstrapping || holdSkeleton || (hasData && !paintReady) || !ready
  )

  if (error && !hasData) {
    return (
      <ContentError
        label="Couldn’t load"
        title="This page isn’t available right now"
        description="The content didn’t come through. Wait a moment, then refresh — or browse another page."
        actionLabel="Refresh"
        onAction={() => window.location.reload()}
        secondaryTo="/about"
        secondaryLabel="Back to About"
      />
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
