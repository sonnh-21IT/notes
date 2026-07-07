import { Plus, X } from 'lucide-react'

function AdminTagSection({
  selectedTags,
  tagQuery,
  tagFieldError,
  matchedExistingTag,
  canCreateTag,
  creatingTag,
  allTags,
  visibleTags,
  selectedTagIds,
  onTagQueryChange,
  onTagInputKeyDown,
  onCreateTag,
  onRemoveTag,
  onToggleTag,
  onAttachExisting,
}) {
  return (
    <div className="admin-note-tags">
      <span className="admin-label">Tags</span>

      {selectedTags.length > 0 && (
        <div className="admin-tag-selected" aria-label="Tags on this note">
          {selectedTags.map((tag) => (
            <span key={tag.id} className="admin-tag-chip">
              {tag.name}
              <button
                type="button"
                className="admin-tag-chip-remove"
                aria-label={`Remove ${tag.name}`}
                onClick={() => onRemoveTag(tag.id)}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="admin-tag-composer">
        <input
          className="admin-input"
          placeholder="New tag name"
          value={tagQuery}
          onChange={onTagQueryChange}
          onKeyDown={onTagInputKeyDown}
          disabled={creatingTag}
        />
        <button
          type="button"
          className="admin-tag-composer-btn"
          aria-label="Add tag to library"
          title="Add tag to library"
          disabled={!canCreateTag || creatingTag}
          onClick={onCreateTag}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>

      {matchedExistingTag ? (
        <p className="admin-field-hint">
          “{matchedExistingTag.name}” already exists —
          {' '}
          <button type="button" className="admin-inline-link" onClick={onAttachExisting}>
            attach to this note
          </button>
        </p>
      ) : (
        <p className="admin-field-hint">
          Type a new name and press + to save it, then pick tags below.
        </p>
      )}

      {tagFieldError && <p className="admin-field-error">{tagFieldError}</p>}

      {allTags.length > 0 ? (
        <div className="admin-tag-options" role="group" aria-label="Available tags">
          {visibleTags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                className={`admin-tag-option${selected ? ' active' : ''}`}
                aria-pressed={selected}
                onClick={() => onToggleTag(tag.id)}
              >
                {tag.name}
              </button>
            )
          })}
          {visibleTags.length === 0 && (
            <p className="admin-field-hint">No tags match your search.</p>
          )}
        </div>
      ) : (
        <p className="admin-field-hint">No tags yet. Create one above.</p>
      )}
    </div>
  )
}

export default AdminTagSection
