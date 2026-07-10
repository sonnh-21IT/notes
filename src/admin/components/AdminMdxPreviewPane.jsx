import AdminFlash from '@/admin/components/AdminFlash'
import MdxBody from '@/mdx/MdxBody'

function AdminMdxPreviewPane({ loading, error, MdxContent, articleClassName, hint, header }) {
  return (
    <div className="admin-preview-pane">
      {hint}
      {loading ? (
        <p className="admin-preview-rendering" role="status" aria-live="polite">
          Rendering preview…
        </p>
      ) : (
        <article className={articleClassName}>
          {header}
          {error ? (
            <AdminFlash type="error">Couldn&apos;t render the preview. Check the formatting and try again.</AdminFlash>
          ) : (
            <MdxBody component={MdxContent} />
          )}
        </article>
      )}
    </div>
  )
}

export default AdminMdxPreviewPane
