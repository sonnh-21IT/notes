import { useEffect } from 'react'
import { AlertTriangle, FileText, Info, StickyNote } from 'lucide-react'
import PageLoading from '@/ui/PageLoading'
import AdminListItem from '@/admin/components/AdminListItem'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import { useAdminContentList } from '@/admin/hooks/useAdminContentList'

const pageIcons = {
  about: Info,
  notes: StickyNote,
  'not-found': AlertTriangle,
}

function AdminContentListPage() {
  const toast = useAdminToast()
  const { loading, error, data: pages } = useAdminContentList()

  useEffect(() => {
    if (error?.message) toast.showError(error.message)
  }, [error, toast])

  if (loading) return <PageLoading label="Loading content" />

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Content"
        title="Static pages"
        description="Site-wide MDX pages — about, notes intro, and 404."
      />

      <ul className="admin-list">
        {(pages ?? []).map((page) => {
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
