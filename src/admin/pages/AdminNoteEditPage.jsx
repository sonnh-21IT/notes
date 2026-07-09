import { Link, useParams } from 'react-router-dom'
import ArticleHeader from '@/mdx/components/ArticleHeader'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminEditorToolbar from '@/admin/components/AdminEditorToolbar'
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
  const { slug: routeSlug } = useParams()
  return <AdminNoteEditPageView key={routeSlug} />
}

function AdminNoteEditPageView() {
  const editor = useAdminNoteEditor()
  const {
    loading,
    isNew,
    slug,
    view,
    isPreview,
    saveDisabled,
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
        {isNew ? (form.title.trim() || 'New') : (form.title.trim() || slug)}
        {isPreview && (
          <>
            <span aria-hidden="true"> / </span>
            Preview
          </>
        )}
      </p>

      <AdminPageHeader
        title={form.title.trim() || (isNew ? 'New note' : slug)}
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
        saveLabel="Save note"
        disabled={Boolean(confirm)}
        saveDisabled={saveDisabled}
        extra={
          view === 'edit' && !isNew ? (
            <button
              type="button"
              className="admin-button admin-button--danger"
              onClick={handleDelete}
              disabled={Boolean(confirm)}
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
