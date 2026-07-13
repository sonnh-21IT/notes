import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { usePaintReady } from '@/hooks/usePaintReady'
import RevealGate from '@/ui/RevealGate'

/** Skeleton until load settles, min display time, and children have painted — then crossfade.
 *  Pass `ready={false}` to keep the skeleton up until an external gate opens.
 */
function DbLoadingScreen({ loading, skeleton, children, ready = true }) {
  const holdSkeleton = useDeferredLoading(Boolean(loading), { delayMs: 0, minMs: 280 })
  const hasContent = !loading
  const paintReady = usePaintReady(hasContent)
  const pending = Boolean(skeleton) && (loading || holdSkeleton || !paintReady || !ready)

  return (
    <RevealGate pending={pending} skeleton={skeleton}>
      {hasContent ? children : null}
    </RevealGate>
  )
}

export default DbLoadingScreen
