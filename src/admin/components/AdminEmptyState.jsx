function AdminEmptyState({ title, description, action }) {
  return (
    <div className="admin-empty">
      <p className="admin-empty-title">{title}</p>
      {description && <p className="admin-empty-desc">{description}</p>}
      {action && <div className="admin-empty-action">{action}</div>}
    </div>
  )
}

export default AdminEmptyState
