import { Check, X } from 'lucide-react'

function AdminSlugStatus({ status }) {
  if (status === 'available') {
    return (
      <span className="admin-slug-status admin-slug-status--ok" aria-label="Slug is available">
        <Check size={12} strokeWidth={2.5} aria-hidden="true" />
      </span>
    )
  }

  if (status === 'unavailable') {
    return (
      <span className="admin-slug-status admin-slug-status--bad" aria-label="Slug is not available">
        <X size={12} strokeWidth={2.5} aria-hidden="true" />
      </span>
    )
  }

  return <span className="admin-slug-status" aria-hidden="true" />
}

export default AdminSlugStatus
