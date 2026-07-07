function Callout({ title, type = 'info', children }) {
  return (
    <aside className={`callout callout-${type}`}>
      {title ? <strong className="callout-title">{title}</strong> : null}
      <div className="callout-body">{children}</div>
    </aside>
  )
}

export default Callout
