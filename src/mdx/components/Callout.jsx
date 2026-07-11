import '@/styles/public/mdx/callout.css'

function Callout({ title, type = 'info', children }) {
  const kind = String(type || 'info').toLowerCase()

  return (
    <aside className={`callout callout-${kind}`} data-callout={kind}>
      {title ? <strong className="callout-title">{title}</strong> : null}
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export default Callout
