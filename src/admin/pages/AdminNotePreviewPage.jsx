import { Navigate, useParams } from 'react-router-dom'
import { loadNoteDraft } from '@/admin/lib/noteDraft'

function AdminNotePreviewPage() {
  const { slug: routeSlug } = useParams()
  const draft = loadNoteDraft()

  return (
    <Navigate
      to={`/admin/notes/${routeSlug}`}
      replace
      state={{ view: 'preview', draft: draft?.editSlug === routeSlug ? draft : undefined }}
    />
  )
}

export default AdminNotePreviewPage
