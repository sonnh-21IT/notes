import { useEffect } from 'react'

function AdminConfirmPanel({
  title,
  description,
  tone = 'warn',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape' && !loading) onCancel()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel, loading])

  return (
    <div className="admin-confirm-overlay" onClick={loading ? undefined : onCancel}>
      <div
        className={`admin-confirm admin-confirm--${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="admin-confirm-title">{title}</h2>
        {description && <p className="admin-confirm-desc">{description}</p>}
        <div className="admin-confirm-actions">
          <button type="button" className="admin-button admin-button--ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-button admin-button--${tone === 'danger' ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminConfirmPanel
