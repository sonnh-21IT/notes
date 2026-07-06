import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

function AdminListItem({ to, icon: Icon, title, meta, badge }) {
  return (
    <li>
      <Link className="admin-list-link" to={to}>
        {Icon && (
          <span className="admin-list-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>
        )}
        <span className="admin-list-body">
          <span className="admin-list-title-row">
            <span className="admin-list-title">{title}</span>
            {badge}
          </span>
          {meta && <span className="admin-list-meta">{meta}</span>}
        </span>
        <ChevronRight className="admin-list-chevron" size={18} aria-hidden="true" />
      </Link>
    </li>
  )
}

export default AdminListItem
