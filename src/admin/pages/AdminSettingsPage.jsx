import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminFieldError from '@/admin/components/AdminFieldError'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import { settingsSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { fieldClassName, validateSettings } from '@/admin/lib/validation'
import { adminGetSettings, adminUpdateSettings } from '@/data/supabase/admin.provider'

function emptyLink() {
  return { id: '', label: '', url: '' }
}

function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [headerTitle, setHeaderTitle] = useState('')
  const [headerTagline, setHeaderTagline] = useState('')
  const [socialLinks, setSocialLinks] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(null)

  useEffect(() => {
    adminGetSettings()
      .then(({ header, footer }) => {
        const nextTitle = header.title ?? ''
        const nextTagline = header.tagline ?? ''
        const nextLinks = footer.socialLinks?.length ? footer.socialLinks : [emptyLink()]
        setHeaderTitle(nextTitle)
        setHeaderTagline(nextTagline)
        setSocialLinks(nextLinks)
        setBaseline(settingsSnapshot({
          headerTitle: nextTitle,
          headerTagline: nextTagline,
          socialLinks: nextLinks,
        }))
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  function updateLink(index, field, value) {
    setSocialLinks((links) => links.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
    const key = `socialLinks.${index}.${field}`
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: '' }))
    }
  }

  function runValidation() {
    const result = validateSettings({ headerTitle, socialLinks })
    setFieldErrors(result.errors)
    return result.valid
  }

  async function performSave() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await adminUpdateSettings({
        header: { title: headerTitle, tagline: headerTagline },
        footer: {
          socialLinks: socialLinks.filter((link) => link.label && link.url),
        },
      })
      setBaseline(settingsSnapshot({ headerTitle, headerTagline, socialLinks }))
      setConfirm(null)
      setMessage('Settings saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  function requestRemoveLink(index) {
    setError('')
    setMessage('')
    setConfirm({
      title: 'Remove social link?',
      description: 'This removes the row from settings. Save changes to apply it publicly.',
      tone: 'warn',
      confirmLabel: 'Remove',
      onConfirm: () => {
        setSocialLinks((links) => links.filter((_, i) => i !== index))
        setConfirm(null)
      },
    })
  }

  function handleSave(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!runValidation()) return

    setConfirm({
      title: 'Save settings?',
      description: 'Header and footer changes will appear on every public page.',
      tone: 'warn',
      confirmLabel: 'Save changes',
      onConfirm: performSave,
    })
  }

  const currentSnapshot = useMemo(
    () => settingsSnapshot({ headerTitle, headerTagline, socialLinks }),
    [headerTitle, headerTagline, socialLinks],
  )

  if (loading) return <PageLoading label="Loading settings" />

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="Site" title="Settings" description="Header and footer shown on every page." />

      <form className="admin-form-body" onSubmit={handleSave}>
        <div className="admin-settings-fields">
          <label className="admin-field">
            <span className="admin-label">Title</span>
            <input
              className={fieldClassName('admin-input', fieldErrors.headerTitle)}
              value={headerTitle}
              onChange={(e) => {
                setHeaderTitle(e.target.value)
                if (fieldErrors.headerTitle) setFieldErrors((current) => ({ ...current, headerTitle: '' }))
              }}
            />
            <AdminFieldError message={fieldErrors.headerTitle} />
          </label>

          <label className="admin-field">
            <span className="admin-label">Tagline</span>
            <input className="admin-input" value={headerTagline} onChange={(e) => setHeaderTagline(e.target.value)} />
          </label>
        </div>

        <div className="admin-settings-links">
          <div className="admin-field-toolbar">
            <span className="admin-label">Social links</span>
            <button
              type="button"
              className="admin-button admin-button--ghost admin-button--sm"
              onClick={() => setSocialLinks((links) => [...links, emptyLink()])}
            >
              <Plus size={16} aria-hidden="true" />
              Add
            </button>
          </div>

          <div className="admin-stack admin-stack--sm">
            {socialLinks.map((link, index) => (
              <div key={index} className="admin-link-row">
                <input
                  className="admin-input"
                  placeholder="ID"
                  value={link.id}
                  onChange={(e) => updateLink(index, 'id', e.target.value)}
                />
                <input
                  className={fieldClassName('admin-input', fieldErrors[`socialLinks.${index}.label`])}
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) => updateLink(index, 'label', e.target.value)}
                />
                <input
                  className={fieldClassName('admin-input admin-input--grow', fieldErrors[`socialLinks.${index}.url`])}
                  placeholder="https://…"
                  value={link.url}
                  onChange={(e) => updateLink(index, 'url', e.target.value)}
                />
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label="Remove link"
                  onClick={() => requestRemoveLink(index)}
                >
                  <Trash2 size={16} />
                </button>
                {(fieldErrors[`socialLinks.${index}.label`] || fieldErrors[`socialLinks.${index}.url`]) && (
                  <div className="admin-link-row-errors">
                    <AdminFieldError message={fieldErrors[`socialLinks.${index}.label`]} />
                    <AdminFieldError message={fieldErrors[`socialLinks.${index}.url`]} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <AdminValidationSummary errors={fieldErrors} />
        <AdminFlash type="error">{error}</AdminFlash>
        <AdminFlash type="success">{message}</AdminFlash>

        {confirm && (
          <AdminConfirmPanel
            title={confirm.title}
            description={confirm.description}
            tone={confirm.tone}
            confirmLabel={confirm.confirmLabel}
            cancelLabel="Cancel"
            loading={saving}
            onCancel={() => setConfirm(null)}
            onConfirm={confirm.onConfirm}
          />
        )}

        <div className="admin-form-footer admin-form-footer--sticky">
          <button type="submit" className="admin-button admin-button--primary" disabled={saving || Boolean(confirm) || !isDirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettingsPage
