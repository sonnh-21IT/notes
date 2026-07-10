import { useEffect } from 'react'
import { AlertTriangle, FileText, Info, StickyNote } from 'lucide-react'
import DbLoadingScreen from '@/ui/DbLoadingScreen'
import { AdminContentListSkeleton } from '@/ui/skeletons'
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

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Content"
        title="Static pages"
        description="Pages shown across the site: About, Notes intro, and the not-found page."
      />

      <DbLoadingScreen loading={loading} skeleton={<AdminContentListSkeleton />}>
        <ul className="admin-list">
          {(pages ?? []).map((page) => {
            const Icon = pageIcons[page.slug] ?? FileText
            return (
              <AdminListItem
                key={page.slug}
                to={`/admin/content/${page.slug}`}
                icon={Icon}
                title={page.title || page.slug}
                meta={page.slug === 'not-found' ? 'Not found page' : `/${page.slug}`}
              />
            )
          })}
        </ul>
      </DbLoadingScreen>
    </div>
  )
}

export default AdminContentListPage
