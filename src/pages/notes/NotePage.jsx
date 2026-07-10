import { useParams } from 'react-router-dom'
import ArticleHeader from '@/mdx/components/ArticleHeader'
import MdxBody from '@/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import PageMeta from '@/ui/PageMeta'
import { NotePageSkeleton } from '@/ui/skeletons'
import { useNote } from '@/hooks/usePageContent'

function NotePage() {
  const { slug } = useParams()
  const { loading, error, data: note } = useNote(slug)

  if (!loading && !error && !note) {
    return (
      <section className="page-stack content">
        <PageMeta title="Note not found" path={`/notes/${slug}`} />
        <p className="content-label">Not found</p>
        <h1 className="content-title">This note isn&apos;t available</h1>
      </section>
    )
  }

  return (
    <PageLoadState
      loading={loading}
      error={error}
      hasData={Boolean(note)}
      skeleton={<NotePageSkeleton />}
    >
      {note && (
        <>
          <PageMeta
            title={note.title}
            description={note.summary}
            path={`/notes/${note.slug}`}
            type="article"
            image={note.coverImage}
          />
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
        </>
      )}
    </PageLoadState>
  )
}

export default NotePage
