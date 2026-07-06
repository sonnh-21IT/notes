import MdxBody from '@/content/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import { usePageContent } from '@/hooks/usePageContent'

function AboutPage() {
  const { loading, error, data: aboutContent } = usePageContent('about')

  return (
    <PageLoadState loading={loading} error={error}>
      <article className="page-stack content about-page">
        <MdxBody component={aboutContent?.MdxContent} />
      </article>
    </PageLoadState>
  )
}

export default AboutPage
