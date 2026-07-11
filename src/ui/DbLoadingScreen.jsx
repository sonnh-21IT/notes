import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { usePaintReady } from '@/hooks/usePaintReady'
import RevealGate from '@/ui/RevealGate'

/** Skeleton until load settles, min display time, and children have painted — then crossfade. */
function DbLoadingScreen({ loading, skeleton, children }) {
  const holdSkeleton = useDeferredLoading(Boolean(loading), { delayMs: 0, minMs: 280 })
  const hasContent = !loading
  const paintReady = usePaintReady(hasContent)
  const pending = Boolean(skeleton) && (loading || holdSkeleton || !paintReady)

  return (
    <RevealGate pending={pending} skeleton={skeleton}>
      {hasContent ? children : null}
    </RevealGate>
  )
}

export default DbLoadingScreen
