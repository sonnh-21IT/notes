function AdminPageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-text">
        {eyebrow && <p className="admin-page-eyebrow">{eyebrow}</p>}
        <h1 className="admin-page-title">{title}</h1>
        {description && <p className="admin-page-desc">{description}</p>}
      </div>
      {action && <div className="admin-page-action">{action}</div>}
    </header>
  )
}

export default AdminPageHeader
