import { Link } from 'react-router-dom'
import AdminNoteFlags from '@/admin/components/AdminNoteFlags'

function AdminNoteListItem({
  note,
  meta,
  onTogglePublished,
  onTogglePinned,
}) {
  return (
    <li>
      <div className="admin-list-row">
        <Link className="admin-list-link" to={`/admin/notes/${note.slug}`}>
          <span className="admin-list-body">
            <span className="admin-list-title">{note.title}</span>
            {meta ? <span className="admin-list-meta">{meta}</span> : null}
          </span>
        </Link>

        <AdminNoteFlags
          published={note.published}
          pinned={note.pinned}
          onTogglePublished={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onTogglePublished(note)
          }}
          onTogglePinned={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onTogglePinned(note)
          }}
        />
      </div>
    </li>
  )
}

export default AdminNoteListItem
