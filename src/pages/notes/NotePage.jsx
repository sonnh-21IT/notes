import { useParams } from 'react-router-dom'
import ArticleHeader from '@/content/components/ArticleHeader'
import MdxBody from '@/content/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import { useNote } from '@/hooks/usePageContent'

function NotePage() {
  const { slug } = useParams()
  const { loading, error, data: note } = useNote(slug)

  if (!loading && !error && !note) {
    return (
      <section className="page-stack content">
        <p className="content-label">Missing content</p>
        <h1 className="content-title">Note not found</h1>
      </section>
    )
  }

  return (
    <PageLoadState loading={loading} error={error}>
      {note && (
        <article className="page-stack content note-page">
          <ArticleHeader
            title={note.title}
            publishedAt={note.publishedAt}
            category={note.category}
            coverImage={note.coverImage}
            tags={note.tags}
          />
          <MdxBody component={note.MdxContent} />
        </article>
      )}
    </PageLoadState>
  )
}

export default NotePage
