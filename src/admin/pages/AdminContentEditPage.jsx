import { Link } from 'react-router-dom'
import DbLoadingScreen from '@/ui/DbLoadingScreen'
import { AdminContentEditSkeleton } from '@/ui/skeletons'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminEditorToolbar from '@/admin/components/AdminEditorToolbar'
import AdminField from '@/admin/components/AdminField'
import AdminMdxPreviewPane from '@/admin/components/AdminMdxPreviewPane'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import { useAdminContentEditor } from '@/admin/hooks/useAdminContentEditor'
import { fieldClassName } from '@/admin/lib/validation'
import { contentPreviewClassName } from '@/admin/lib/contentDraft'

function AdminContentEditPage() {
  const editor = useAdminContentEditor()
  const {
    slug,
    title,
    loading,
    view,
    isPreview,
    isDirty,
    confirm,
    setConfirm,
    setView,
    body,
    setBody,
    fieldErrors,
    clearFieldError,
    mdxPreview,
    requestSave,
    handleShowPreview,
  } = editor

  const pageLabel = title.trim() || (!loading ? slug : '')

  return (
    <div className="admin-page admin-page--editor">
      <p className="admin-breadcrumb">
        <Link to="/admin/content">Content</Link>
        {pageLabel ? (
          <>
            <span aria-hidden="true"> / </span>
            {pageLabel}
          </>
        ) : null}
        {isPreview && (
          <>
            <span aria-hidden="true"> / </span>
            Preview
          </>
        )}
      </p>

      <AdminPageHeader
        title={pageLabel}
        description={isPreview ? 'Preview how this page will look on the site.' : 'Edit the page content.'}
      />

      {isPreview && (
        <div className="admin-preview-banner" role="status">
          Preview — not saved yet. This is how the page will look on the site.
        </div>
      )}

      <DbLoadingScreen loading={loading} skeleton={<AdminContentEditSkeleton />}>
        {view === 'edit' ? (
          <form
            className="admin-form-body"
            onSubmit={(event) => {
              event.preventDefault()
              requestSave()
            }}
          >
            <section className="admin-section">
              <AdminField label="Page content" error={fieldErrors.body}>
                <textarea
                  className={fieldClassName('admin-textarea admin-textarea--code', fieldErrors.body)}
                  rows={22}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value)
                    if (fieldErrors.body) clearFieldError('body')
                  }}
                />
              </AdminField>
            </section>

            <AdminValidationSummary errors={fieldErrors} />
          </form>
        ) : (
          <AdminMdxPreviewPane
            loading={mdxPreview.loading}
            error={mdxPreview.error}
            MdxContent={mdxPreview.MdxContent}
            articleClassName={contentPreviewClassName(slug)}
            hint={slug === 'notes' && (
              <p className="admin-field-hint admin-preview-hint">
                Only the notes intro is shown here. The notes list below it on the live site is unchanged.
              </p>
            )}
          />
        )}
      </DbLoadingScreen>

      {confirm && (
        <AdminConfirmPanel
          title={confirm.title}
          description={confirm.description}
          tone={confirm.tone}
          confirmLabel={confirm.confirmLabel}
          cancelLabel="Cancel"
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}

      <AdminEditorToolbar
        mode={view}
        onShowPreview={handleShowPreview}
        onBackToEdit={() => {
          setConfirm(null)
          setView('edit')
        }}
        onSave={requestSave}
        saveLabel="Save page"
        disabled={Boolean(confirm) || loading}
        saveDisabled={!isDirty || loading || (isPreview && mdxPreview.loading)}
      />
    </div>
  )
}

export default AdminContentEditPage
