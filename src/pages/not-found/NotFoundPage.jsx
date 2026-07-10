import MdxBody from '@/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import PageMeta from '@/ui/PageMeta'
import { ContentPageSkeleton } from '@/ui/skeletons'
import { usePageContent } from '@/hooks/usePageContent'

function NotFoundPage() {
  const { loading, error, data: notFoundContent } = usePageContent('not-found')

  return (
    <>
      <PageMeta title={notFoundContent?.title || 'Not found'} />
      <article className="page-stack content">
        <PageLoadState
          loading={loading}
          error={error}
          hasData={Boolean(notFoundContent)}
          skeleton={<ContentPageSkeleton />}
        >
          <MdxBody component={notFoundContent?.MdxContent} empty="not-found" />
        </PageLoadState>
      </article>
    </>
  )
}

export default NotFoundPage
