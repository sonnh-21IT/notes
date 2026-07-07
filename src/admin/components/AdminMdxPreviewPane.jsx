import AdminFlash from '@/admin/components/AdminFlash'
import MdxBody from '@/mdx/MdxBody'
import PageLoading from '@/ui/PageLoading'

function AdminMdxPreviewPane({ loading, error, MdxContent, articleClassName, hint, header }) {
  return (
    <div className="admin-preview-pane">
      {hint}
      {loading ? (
        <PageLoading label="Rendering preview" />
      ) : (
        <article className={articleClassName}>
          {header}
          {error ? (
            <AdminFlash type="error">MDX error: {error}</AdminFlash>
          ) : (
            <MdxBody component={MdxContent} />
          )}
        </article>
      )}
    </div>
  )
}

export default AdminMdxPreviewPane
