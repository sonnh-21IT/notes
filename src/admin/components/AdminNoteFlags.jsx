import { Eye, EyeOff, Pin, PinOff } from 'lucide-react'

function AdminNoteFlags({
  published,
  pinned,
  onTogglePublished,
  onTogglePinned,
  disabled = false,
}) {
  return (
    <div className="admin-note-flags" role="group" aria-label="Note status">
      <button
        type="button"
        className={`admin-note-flag${published ? ' is-on' : ' is-off'}`}
        aria-pressed={published}
        aria-label={published ? 'Unpublish note' : 'Publish note'}
        title={published ? 'Visible on site — click to unpublish' : 'Draft — click to publish'}
        disabled={disabled}
        onClick={onTogglePublished}
      >
        {published
          ? <Eye size={16} strokeWidth={2.25} aria-hidden="true" />
          : <EyeOff size={16} strokeWidth={2.25} aria-hidden="true" />}
      </button>
      <button
        type="button"
        className={`admin-note-flag${pinned ? ' is-on' : ' is-off'}`}
        aria-pressed={pinned}
        aria-label={pinned ? 'Unpin note' : 'Pin note on About'}
        title={pinned ? 'Pinned on About — click to unpin' : 'Not pinned — click to pin on About'}
        disabled={disabled}
        onClick={onTogglePinned}
      >
        {pinned
          ? <Pin size={16} strokeWidth={2.25} aria-hidden="true" />
          : <PinOff size={16} strokeWidth={2.25} aria-hidden="true" />}
      </button>
    </div>
  )
}

export default AdminNoteFlags
