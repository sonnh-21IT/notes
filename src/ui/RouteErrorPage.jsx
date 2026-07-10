import { Link } from 'react-router-dom'

function RouteErrorPage() {
  return (
    <section className="page-stack content">
      <p className="content-label">Oops</p>
      <h1 className="content-title">Something went wrong</h1>
      <p className="content-lead">We hit a problem loading this page.</p>
      <p>
        <Link className="content-link" to="/about">Back to site</Link>
      </p>
    </section>
  )
}

export default RouteErrorPage
