function ContentStatusIndicator() {
  return (
    <div className="content-status-inner" role="status" aria-live="polite" aria-busy="true">
      <div className="content-status-pipeline" aria-hidden="true">
        <span className="content-status-node" />
        <span className="content-status-node" />
        <span className="content-status-node" />
        <span className="content-status-node" />
      </div>
      <div className="content-status-log" aria-hidden="true">
        <span className="content-status-caret">$</span>
        <span className="content-status-log-text">automation.run --stage deploy</span>
      </div>
    </div>
  )
}

export default ContentStatusIndicator
