import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import { usePaintReady } from '@/hooks/usePaintReady'

/**
 * Keep sibling skeletons up until every flag is false, then release together
 * (min hold + paint). Fetches stay independent — only the reveal is synced.
 */
export function useSyncedReveal(...loadingFlags) {
  const waiting = loadingFlags.some(Boolean)
  const holdReveal = useDeferredLoading(waiting, { delayMs: 0, minMs: 280 })
  const paintReady = usePaintReady(!waiting)
  return !waiting && !holdReveal && paintReady
}
