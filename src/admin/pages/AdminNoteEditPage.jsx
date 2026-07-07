import { Link } from 'react-router-dom'
import ArticleHeader from '@/mdx/components/ArticleHeader'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminEditorToolbar from '@/admin/components/AdminEditorToolbar'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminMdxPreviewPane from '@/admin/components/AdminMdxPreviewPane'
import AdminNoteForm from '@/admin/components/AdminNoteForm'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import { useAdminNoteEditor } from '@/admin/hooks/useAdminNoteEditor'
import { todayIsoDate } from '@/utils/dates'

const headerDescriptions = {
  preview: 'Preview how this note will look on the site.',
  new: 'Create a new article.',
  edit: 'Edit metadata and MDX body.',
}

function AdminNoteEditPage() {
  const editor = useAdminNoteEditor()
  const {
    loading,
    isNew,
    slug,
    view,
    isPreview,
    isDirty,
    saving,
    error,
    message,
    confirm,
    setConfirm,
    setView,
    mdxPreview,
    preview,
    form,
    requestSave,
    handleShowPreview,
    handleDelete,
  } = editor

  if (loading) return <PageLoading label="Loading note" />

  const headerMode = isPreview ? 'preview' : isNew ? 'new' : 'edit'

  return (
    <div className="admin-page admin-page--editor">
      <p className="admin-breadcrumb">
        <Link to="/admin/notes">Notes</Link>
        <span aria-hidden="true"> / </span>
        {isNew ? 'New' : slug}
        {isPreview && (
          <>
            <span aria-hidden="true"> / </span>
            Preview
          </>
        )}
      </p>

      <AdminPageHeader
        title={isNew ? 'New note' : form.title}
        description={headerDescriptions[headerMode]}
      />

      {isPreview && (
        <div className="admin-preview-banner" role="status">
          Preview — not saved yet. Review below, then save or go back to edit.
        </div>
      )}

      {view === 'edit' ? (
        <AdminNoteForm form={form} onSubmit={requestSave} />
      ) : (
        <AdminMdxPreviewPane
          loading={mdxPreview.loading}
          error={mdxPreview.error}
          MdxContent={mdxPreview.MdxContent}
          articleClassName="page-stack content note-page admin-preview-article"
          header={(
            <ArticleHeader
              title={preview.title.trim() || 'Untitled'}
              publishedAt={preview.publishedAt || todayIsoDate()}
              category={preview.categoryName}
              coverImage={preview.coverImage || null}
              tags={preview.selectedTags.map((tag) => tag.name)}
            />
          )}
        />
      )}

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

      <AdminEditorToolbar
        mode={view}
        onShowPreview={handleShowPreview}
        onBackToEdit={() => {
          setConfirm(null)
          setView('edit')
        }}
        onSave={requestSave}
        saveLabel="Save note"
        saving={saving}
        disabled={Boolean(confirm)}
        saveDisabled={!isDirty || (isPreview && mdxPreview.loading)}
        extra={
          view === 'edit' && !isNew ? (
            <button
              type="button"
              className="admin-button admin-button--danger"
              onClick={handleDelete}
              disabled={saving || Boolean(confirm)}
            >
              Delete
            </button>
          ) : null
        }
      />
    </div>
  )
}

export default AdminNoteEditPage
