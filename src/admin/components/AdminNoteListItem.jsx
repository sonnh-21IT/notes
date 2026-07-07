import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pin, PinOff } from 'lucide-react'

function AdminNoteListItem({
  note,
  meta,
  busy,
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

        <div className="admin-note-flags" role="group" aria-label="Note status">
          <button
            type="button"
            className={`admin-note-flag${note.published ? ' is-on' : ' is-off'}`}
            disabled={busy}
            aria-pressed={note.published}
            aria-label={note.published ? 'Unpublish note' : 'Publish note'}
            title={note.published ? 'Visible on site — click to unpublish' : 'Draft — click to publish'}
            onClick={() => onTogglePublished(note)}
          >
            {note.published
              ? <Eye size={16} strokeWidth={2.25} aria-hidden="true" />
              : <EyeOff size={16} strokeWidth={2.25} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`admin-note-flag${note.pinned ? ' is-on' : ' is-off'}`}
            disabled={busy}
            aria-pressed={note.pinned}
            aria-label={note.pinned ? 'Unpin note' : 'Pin note on About'}
            title={note.pinned ? 'Pinned on About — click to unpin' : 'Not pinned — click to pin on About'}
            onClick={() => onTogglePinned(note)}
          >
            {note.pinned
              ? <Pin size={16} strokeWidth={2.25} aria-hidden="true" />
              : <PinOff size={16} strokeWidth={2.25} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </li>
  )
}

export default AdminNoteListItem
