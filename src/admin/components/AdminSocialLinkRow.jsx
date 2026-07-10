import { Trash2 } from 'lucide-react'
import AdminFieldError from '@/admin/components/AdminFieldError'
import { fieldClassName } from '@/admin/lib/validation'

function AdminSocialLinkRow({ link, index, fieldErrors, onChange, onRemove }) {
  const labelError = fieldErrors[`socialLinks.${index}.label`]
  const urlError = fieldErrors[`socialLinks.${index}.url`]

  return (
    <div className="admin-link-row">
      <input
        className="admin-input"
        placeholder="github"
        value={link.id}
        onChange={(e) => onChange(index, 'id', e.target.value)}
        aria-label="Link key"
        title="Short key for the link, e.g. github"
      />
      <input
        className={fieldClassName('admin-input', labelError)}
        placeholder="Label"
        value={link.label}
        onChange={(e) => onChange(index, 'label', e.target.value)}
        aria-label="Link label"
      />
      <input
        className={fieldClassName('admin-input admin-input--grow', urlError)}
        placeholder="https://…"
        value={link.url}
        onChange={(e) => onChange(index, 'url', e.target.value)}
        aria-label="Link URL"
      />
      <button
        type="button"
        className="admin-icon-button"
        aria-label="Remove link"
        onClick={() => onRemove(index)}
      >
        <Trash2 size={16} />
      </button>
      {(labelError || urlError) && (
        <div className="admin-link-row-errors">
          <AdminFieldError message={labelError} />
          <AdminFieldError message={urlError} />
        </div>
      )}
    </div>
  )
}

export default AdminSocialLinkRow
