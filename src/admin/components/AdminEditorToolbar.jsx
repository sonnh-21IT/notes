import { ArrowLeft, Eye } from 'lucide-react'

function AdminEditorToolbar({
  mode,
  onShowPreview,
  onBackToEdit,
  onSave,
  saveLabel,
  disabled = false,
  saveDisabled = false,
  extra,
}) {
  return (
    <div className="admin-form-footer admin-preview-actions">
      {mode === 'preview' ? (
        <button type="button" className="admin-button admin-button--ghost" onClick={onBackToEdit} disabled={disabled}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to edit
        </button>
      ) : (
        <button type="button" className="admin-button admin-button--ghost" onClick={onShowPreview} disabled={disabled}>
          <Eye size={16} aria-hidden="true" />
          Preview
        </button>
      )}
      <button
        type="button"
        className="admin-button admin-button--primary"
        onClick={onSave}
        disabled={disabled || saveDisabled}
      >
        {saveLabel}
      </button>
      {extra}
    </div>
  )
}

export default AdminEditorToolbar
