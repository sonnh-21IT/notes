import { ArrowLeft, Eye } from 'lucide-react'

function AdminEditorToolbar({
  mode,
  onShowPreview,
  onBackToEdit,
  onSave,
  saveLabel,
  saving = false,
  disabled = false,
  saveDisabled = false,
  extra,
}) {
  const locked = saving || disabled

  return (
    <div className="admin-form-footer admin-preview-actions">
      {mode === 'preview' ? (
        <button type="button" className="admin-button admin-button--ghost" onClick={onBackToEdit} disabled={locked}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to edit
        </button>
      ) : (
        <button type="button" className="admin-button admin-button--ghost" onClick={onShowPreview} disabled={locked}>
          <Eye size={16} aria-hidden="true" />
          Preview
        </button>
      )}
      <button
        type="button"
        className="admin-button admin-button--primary"
        onClick={onSave}
        disabled={locked || saveDisabled}
      >
        {saving ? 'Saving…' : saveLabel}
      </button>
      {extra}
    </div>
  )
}

export default AdminEditorToolbar
