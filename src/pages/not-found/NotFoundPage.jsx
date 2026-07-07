import MdxBody from '@/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import PageMeta from '@/ui/PageMeta'
import { usePageContent } from '@/hooks/usePageContent'

function NotFoundPage() {
  const { loading, error, data: notFoundContent } = usePageContent('not-found')

  return (
    <PageLoadState loading={loading} error={error}>
      <PageMeta title={notFoundContent?.title || 'Not found'} />
      <article className="page-stack content">
        <MdxBody component={notFoundContent?.MdxContent} />
      </article>
    </PageLoadState>
  )
}

export default NotFoundPage
