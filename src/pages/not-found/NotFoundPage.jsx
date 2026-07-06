import MdxBody from '@/content/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import { usePageContent } from '@/hooks/usePageContent'

function NotFoundPage() {
  const { loading, error, data: notFoundContent } = usePageContent('not-found')

  return (
    <PageLoadState loading={loading} error={error}>
      <article className="page-stack content">
        <MdxBody component={notFoundContent?.MdxContent} />
      </article>
    </PageLoadState>
  )
}

export default NotFoundPage
