function ContentStatusIndicator({ label = 'Loading' }) {
  return (
    <div className="content-status-inner" role="status" aria-live="polite" aria-busy="true">
      <div className="content-status-pipeline" aria-hidden="true">
        <span className="content-status-node" />
        <span className="content-status-node" />
        <span className="content-status-node" />
        <span className="content-status-node" />
      </div>
      <div className="content-status-log">
        <span className="content-status-caret" aria-hidden="true">$</span>
        <span className="content-status-log-text">{label}</span>
      </div>
    </div>
  )
}

export default ContentStatusIndicator
