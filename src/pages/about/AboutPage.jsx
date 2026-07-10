import MdxBody from '@/mdx/MdxBody'
import NotesList from '@/shared/notes/NotesList'
import PageLoadState from '@/ui/PageLoadState'
import PageMeta from '@/ui/PageMeta'
import DbLoadingScreen from '@/ui/DbLoadingScreen'
import { AboutPageSkeleton, AboutPinnedSkeleton } from '@/ui/skeletons'
import { usePageContent, usePinnedNotes } from '@/hooks/usePageContent'

function AboutPage() {
  const { loading, error, data: aboutContent } = usePageContent('about')
  const pinned = usePinnedNotes({ limit: 5 })
  const pinnedNotes = pinned.data ?? []

  return (
    <>
      <PageMeta
        title={aboutContent?.title || 'About'}
        path="/about"
      />
      <article className="page-stack content about-page">
        <PageLoadState
          loading={loading}
          error={error}
          hasData={Boolean(aboutContent)}
          skeleton={<AboutPageSkeleton />}
        >
          <MdxBody component={aboutContent?.MdxContent} empty="about" />
        </PageLoadState>

        <DbLoadingScreen loading={pinned.isInitialLoading} skeleton={<AboutPinnedSkeleton />}>
          {pinnedNotes.length > 0 ? (
            <section className="content-section about-pinned-notes" aria-label="Pinned notes">
              <h2 className="content-section-title">Pinned notes</h2>
              <p className="content-body-text about-pinned-notes-intro">
                Hand-picked write-ups I&apos;d send someone who asks what this site is about.
              </p>
              <NotesList notes={pinnedNotes} />
            </section>
          ) : null}
        </DbLoadingScreen>
      </article>
    </>
  )
}

export default AboutPage
