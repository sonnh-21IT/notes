/** Shared wrapper: content skeletons sit in-flow; quiet = empty aria-busy region. */
function PageSkeletonSlot({ quiet = false, children }) {
  if (quiet) {
    return (
      <div className="page-loading page-loading--quiet" aria-busy="true" aria-live="polite">
        <span className="visually-hidden">Loading</span>
      </div>
    )
  }

  return <div className="page-skeleton-host">{children}</div>
}

export default PageSkeletonSlot
