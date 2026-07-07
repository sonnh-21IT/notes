import { Plus } from 'lucide-react'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminField from '@/admin/components/AdminField'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import AdminSocialLinkRow from '@/admin/components/AdminSocialLinkRow'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import { useAdminSettings } from '@/admin/hooks/useAdminSettings'
import { fieldClassName } from '@/admin/lib/validation'

function emptyLink() {
  return { id: '', label: '', url: '' }
}

function AdminSettingsPage() {
  const settings = useAdminSettings()
  const {
    loading,
    saving,
    error,
    message,
    confirm,
    setConfirm,
    headerTitle,
    setHeaderTitle,
    headerTagline,
    setHeaderTagline,
    socialLinks,
    setSocialLinks,
    fieldErrors,
    clearFieldError,
    updateLink,
    requestRemoveLink,
    handleSave,
    isDirty,
  } = settings

  if (loading) return <PageLoading label="Loading settings" />

  return (
    <div className="admin-page">
      <AdminPageHeader eyebrow="Site" title="Settings" description="Header and footer shown on every page." />

      <form className="admin-form-body" onSubmit={handleSave}>
        <div className="admin-settings-fields">
          <AdminField label="Title" error={fieldErrors.headerTitle}>
            <input
              className={fieldClassName('admin-input', fieldErrors.headerTitle)}
              value={headerTitle}
              onChange={(e) => {
                setHeaderTitle(e.target.value)
                if (fieldErrors.headerTitle) clearFieldError('headerTitle')
              }}
            />
          </AdminField>

          <AdminField label="Tagline">
            <input className="admin-input" value={headerTagline} onChange={(e) => setHeaderTagline(e.target.value)} />
          </AdminField>
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
              <AdminSocialLinkRow
                key={index}
                link={link}
                index={index}
                fieldErrors={fieldErrors}
                onChange={updateLink}
                onRemove={requestRemoveLink}
              />
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
