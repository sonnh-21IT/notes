import '@/styles/public/mdx/endpoint.css'
import { Children } from 'react'

function sectionItems(children) {
  return Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )
}

function Params({ children }) {
  return (
    <section className="mdx-endpoint-section">
      <h4 className="mdx-endpoint-section-title">Parameters</h4>
      <div className="mdx-fields mdx-endpoint-params">{sectionItems(children)}</div>
    </section>
  )
}

function RequestBody({ type, children }) {
  return (
    <section className="mdx-endpoint-section">
      <div className="mdx-endpoint-section-head">
        <h4 className="mdx-endpoint-section-title">Request body</h4>
        {type ? <code className="mdx-endpoint-content-type">{type}</code> : null}
      </div>
      <div className="mdx-endpoint-section-body">{children}</div>
    </section>
  )
}

function Responses({ children }) {
  return (
    <section className="mdx-endpoint-section">
      <h4 className="mdx-endpoint-section-title">Responses</h4>
      <div className="mdx-endpoint-responses">{sectionItems(children)}</div>
    </section>
  )
}

function responseTone(status) {
  const code = Number.parseInt(String(status), 10)
  if (!Number.isFinite(code)) return 'default'
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'redirect'
  if (code >= 400 && code < 500) return 'client'
  if (code >= 500) return 'server'
  return 'default'
}

function Response({ status, description, children }) {
  const tone = responseTone(status)

  return (
    <div className={`mdx-endpoint-response mdx-endpoint-response--${tone}`}>
      <div className="mdx-endpoint-response-bar">
        <span className="mdx-endpoint-status">{status}</span>
        {description ? <span className="mdx-endpoint-response-desc">{description}</span> : null}
      </div>
      {children ? <div className="mdx-endpoint-response-body">{children}</div> : null}
    </div>
  )
}

export { Params, RequestBody, Responses, Response }
