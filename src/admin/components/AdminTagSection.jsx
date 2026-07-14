import { Plus, X } from 'lucide-react'
import AdminGestureActionButton from '@/admin/components/AdminGestureActionButton'

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
  disabled = false,
  onTagQueryChange,
  onTagInputKeyDown,
  onCreateTag,
  onRemoveTag,
  onToggleTag,
  onSelectTag,
  onRequestDeleteTag,
  onAttachExisting,
}) {
  return (
    <div className={`admin-note-tags${disabled ? ' is-disabled' : ''}`}>
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
                disabled={disabled}
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
          disabled={disabled || creatingTag}
        />
        <button
          type="button"
          className="admin-tag-composer-btn"
          aria-label="Create tag"
          title="Create tag"
          disabled={disabled || !canCreateTag || creatingTag}
          onClick={onCreateTag}
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>

      {matchedExistingTag ? (
        <p className="admin-field-hint">
          “{matchedExistingTag.name}” already exists —
          {' '}
          <button
            type="button"
            className="admin-inline-link"
            disabled={disabled}
            onClick={onAttachExisting}
          >
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
              <AdminGestureActionButton
                key={tag.id}
                className={`admin-tag-option${selected ? ' active' : ''}`}
                aria-pressed={selected}
                disabled={disabled}
                menuEnabled={!selected && Boolean(onRequestDeleteTag)}
                onClick={() => onToggleTag(tag.id)}
                onMenuSelect={() => (onSelectTag ?? onToggleTag)(tag.id)}
                onMenuDelete={() => onRequestDeleteTag?.(tag)}
              >
                {tag.name}
              </AdminGestureActionButton>
            )
          })}
          {visibleTags.length === 0 && (
            <p className="admin-field-hint">No tags match your search.</p>
          )}
        </div>
      ) : (
        <p className="admin-field-hint">
          {disabled ? 'Tags are unavailable right now.' : 'No tags yet. Create one above.'}
        </p>
      )}
    </div>
  )
}

export default AdminTagSection
