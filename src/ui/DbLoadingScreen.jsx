import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import PageSkeletonSlot from '@/ui/PageSkeletonSlot'

/** Full-page DB bootstrap: delay + minimum skeleton time, then content. */
function DbLoadingScreen({ loading, skeleton, children }) {
  const showSkeleton = useDeferredLoading(loading)

  if (showSkeleton && skeleton) {
    return <PageSkeletonSlot>{skeleton}</PageSkeletonSlot>
  }

  if (loading || showSkeleton) {
    return <PageSkeletonSlot quiet />
  }

  return children
}

export default DbLoadingScreen
