import { useRouteError, Link } from 'react-router-dom'

function RouteErrorPage() {
  const error = useRouteError()
  const message = error instanceof Error ? error.message : String(error ?? 'Something went wrong')

  return (
    <section className="page-stack content">
      <p className="content-label">Error</p>
      <h1 className="content-title">Something went wrong</h1>
      <p className="content-lead">{message}</p>
      <p>
        <Link className="content-link" to="/about">Back to site</Link>
      </p>
    </section>
  )
}

export default RouteErrorPage
