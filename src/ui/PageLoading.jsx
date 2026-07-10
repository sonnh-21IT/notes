import PageSkeletonSlot from '@/ui/PageSkeletonSlot'

/** Non-DB waits (auth, route chunks) — blank hold, no skeleton chrome. */
function PageLoading() {
  return <PageSkeletonSlot quiet />
}

export default PageLoading
