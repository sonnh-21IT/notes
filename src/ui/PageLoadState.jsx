import PageLoading from '@/ui/PageLoading'

function PageLoadState({ loading, error, children }) {
  if (loading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <section className="page-stack content content-error">
        <h1 className="content-title">Content unavailable</h1>
        <p className="content-lead">{error.message}</p>
      </section>
    )
  }

  return children
}

export default PageLoadState
