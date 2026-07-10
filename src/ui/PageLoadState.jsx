import { useDeferredLoading } from '@/hooks/useDeferredLoading'
import PageSkeletonSlot from '@/ui/PageSkeletonSlot'

function PageLoadState({
  loading = false,
  error = null,
  hasData = false,
  skeleton = null,
  children,
}) {
  const waitingFirst = loading && !hasData
  const showSkeleton = useDeferredLoading(waitingFirst)

  if (error && !hasData) {
    return (
      <section className="page-stack content content-error">
        <h1 className="content-title">Couldn&apos;t load this page</h1>
        <p className="content-lead">Please try again in a moment.</p>
      </section>
    )
  }

  if (showSkeleton && skeleton) {
    return <PageSkeletonSlot>{skeleton}</PageSkeletonSlot>
  }

  if (waitingFirst) {
    return <PageSkeletonSlot quiet />
  }

  return (
    <div className={loading ? 'is-content-validating' : undefined} aria-busy={loading || undefined}>
      {children}
    </div>
  )
}

export default PageLoadState
