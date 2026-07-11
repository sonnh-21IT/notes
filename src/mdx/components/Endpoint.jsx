import '@/styles/public/mdx/endpoint.css'
import { Params, RequestBody, Response, Responses } from '@/mdx/components/EndpointSections'

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options'])

function EndpointBar({ verb, tone, path, summary, toggle }) {
  return (
    <>
      <span className={`mdx-endpoint-method mdx-endpoint-method--${tone}`}>{verb}</span>
      <code className="mdx-endpoint-path">{path}</code>
      {summary ? <span className="mdx-endpoint-summary">{summary}</span> : null}
      {toggle ? <span className="mdx-endpoint-toggle" aria-hidden /> : null}
    </>
  )
}

function Endpoint({ method = 'GET', path, summary, children, defaultOpen = false }) {
  const verb = String(method || 'GET').toUpperCase()
  const tone = METHODS.has(verb.toLowerCase()) ? verb.toLowerCase() : 'get'

  // Compact path-only ops stay static; body content is collapsible.
  if (!children) {
    return (
      <div className="mdx-endpoint">
        <div className="mdx-endpoint-bar">
          <EndpointBar verb={verb} tone={tone} path={path} summary={summary} />
        </div>
      </div>
    )
  }

  return (
    <details className="mdx-endpoint" defaultOpen={defaultOpen}>
      <summary className="mdx-endpoint-bar">
        <EndpointBar verb={verb} tone={tone} path={path} summary={summary} toggle />
      </summary>
      <div className="mdx-endpoint-body">{children}</div>
    </details>
  )
}

export { Params, RequestBody, Responses, Response }
export default Endpoint
