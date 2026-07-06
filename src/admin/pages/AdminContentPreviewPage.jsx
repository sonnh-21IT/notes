import { Navigate, useParams } from 'react-router-dom'
import { loadContentDraft } from '@/admin/lib/contentDraft'

function AdminContentPreviewPage() {
  const { slug } = useParams()
  const draft = loadContentDraft()

  return (
    <Navigate
      to={`/admin/content/${slug}`}
      replace
      state={{ view: 'preview', draft: draft?.slug === slug ? draft : undefined }}
    />
  )
}

export default AdminContentPreviewPage
