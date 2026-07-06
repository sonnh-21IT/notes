import { useEffect, useState } from 'react'
import { AlertTriangle, FileText, Info, StickyNote } from 'lucide-react'
import PageLoading from '@/ui/PageLoading'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminListItem from '@/admin/components/AdminListItem'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import { adminListContent } from '@/data/supabase/admin.provider'

const pageIcons = {
  about: Info,
  notes: StickyNote,
  'not-found': AlertTriangle,
}

function AdminContentListPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pages, setPages] = useState([])

  useEffect(() => {
    adminListContent()
      .then(setPages)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoading label="Loading content" />

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Content"
        title="Static pages"
        description="Site-wide MDX pages — about, notes intro, and 404."
      />

      <AdminFlash type="error">{error}</AdminFlash>

      <ul className="admin-list">
        {pages.map((page) => {
          const Icon = pageIcons[page.slug] ?? FileText
          return (
            <AdminListItem
              key={page.slug}
              to={`/admin/content/${page.slug}`}
              icon={Icon}
              title={page.title || page.slug}
              meta={`/${page.slug === 'not-found' ? '*' : page.slug}`}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default AdminContentListPage
