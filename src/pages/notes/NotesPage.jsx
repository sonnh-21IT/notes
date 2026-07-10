import { useMemo, useState } from 'react'
import { NotesActiveFilters, NotesFilterOptions } from '@/shared/notes/NotesFilterBar'
import NotesList from '@/shared/notes/NotesList'
import MdxBody from '@/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import PageMeta from '@/ui/PageMeta'
import DbLoadingScreen from '@/ui/DbLoadingScreen'
import { NotesIntroSkeleton, NotesListSectionSkeleton } from '@/ui/skeletons'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { usePaginationState } from '@/hooks/usePaginationState'
import { useCategoriesList, useNotesPage, usePageContent, useTagsList } from '@/hooks/usePageContent'

const NOTES_PAGE_SIZE = 10

function NotesPage() {
  const page = usePageContent('notes')
  const tags = useTagsList()
  const categories = useCategoriesList()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [activeTagIds, setActiveTagIds] = useState([])
  const [activeCategoryIds, setActiveCategoryIds] = useState([])
  const filterKey = `${debouncedQuery}\0${activeTagIds.join()}\0${activeCategoryIds.join()}`
  const { pageNumber, setPageNumber } = usePaginationState(filterKey)

  const list = useNotesPage({
    page: pageNumber,
    pageSize: NOTES_PAGE_SIZE,
    query: debouncedQuery,
    tagIds: activeTagIds,
    categoryIds: activeCategoryIds,
  })

  const notesPageContent = page.data
  const allTags = useMemo(() => tags.data ?? [], [tags.data])
  const allCategories = useMemo(() => categories.data ?? [], [categories.data])
  const notes = list.data?.notes ?? []
  const total = list.data?.total ?? 0
  const pageCount = list.data?.pageCount ?? 0
  const listError = list.error

  const selectedCategories = useMemo(
    () => allCategories.filter((category) => activeCategoryIds.includes(category.id)),
    [allCategories, activeCategoryIds],
  )

  const selectedTags = useMemo(
    () => allTags.filter((tag) => activeTagIds.includes(tag.id)),
    [allTags, activeTagIds],
  )

  const filterOptions = useMemo(
    () => [
      ...allCategories
        .filter((category) => !activeCategoryIds.includes(category.id))
        .map((category) => ({ kind: 'category', id: category.id, name: category.name })),
      ...allTags
        .filter((tag) => !activeTagIds.includes(tag.id))
        .map((tag) => ({ kind: 'tag', id: tag.id, name: tag.name })),
    ],
    [allCategories, allTags, activeCategoryIds, activeTagIds],
  )

  const selectFilter = (option) => {
    if (option.kind === 'category') {
      setActiveCategoryIds((current) => [...current, option.id])
      return
    }

    setActiveTagIds((current) => [...current, option.id])
  }

  function removeFilter(kind, id) {
    if (kind === 'category') {
      setActiveCategoryIds((current) => current.filter((item) => item !== id))
      return
    }

    setActiveTagIds((current) => current.filter((item) => item !== id))
  }

  return (
    <>
      <PageMeta
        title={notesPageContent?.title || 'Notes'}
        path="/notes"
      />
      <section className="page-stack content notes-page">
        <PageLoadState
          loading={page.isInitialLoading}
          error={page.error}
          hasData={Boolean(page.data)}
          skeleton={<NotesIntroSkeleton />}
        >
          <MdxBody component={notesPageContent?.MdxContent} empty="notes" />
        </PageLoadState>

        <section className="content-section notes-list-section" aria-label="Notes list">
          {listError && <p className="notes-empty">Couldn&apos;t load notes right now. Please try again.</p>}

          <DbLoadingScreen loading={list.isInitialLoading} skeleton={<NotesListSectionSkeleton />}>
            <div className="notes-list-controls">
              <div className="notes-toolbar">
                <div className="notes-search-wrap">
                  <label className="notes-search">
                    <span className="visually-hidden">Search notes</span>
                    <input
                      type="search"
                      className="notes-search-input"
                      placeholder="Search notes…"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  {query && (
                    <button
                      type="button"
                      className="notes-search-clear"
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                <NotesFilterOptions filterOptions={filterOptions} onSelect={selectFilter} />
              </div>

              <NotesActiveFilters
                selectedCategories={selectedCategories}
                selectedTags={selectedTags}
                onRemove={removeFilter}
              />
            </div>

            {!listError && notes.length === 0 && !list.loading ? (
              <p className="notes-empty">
                {debouncedQuery || activeTagIds.length || activeCategoryIds.length
                  ? 'No notes match your search.'
                  : 'No notes published yet. Check back soon.'}
              </p>
            ) : (
              <NotesList notes={notes} loading={list.isValidating && !list.isInitialLoading} />
            )}
          </DbLoadingScreen>

          {!listError && pageCount >= 1 && (
            <nav className="notes-pagination" aria-label="Notes pagination">
              <button
                type="button"
                className="notes-pagination-btn"
                disabled={pageNumber <= 1 || list.loading}
                onClick={() => setPageNumber((current) => current - 1)}
              >
                Previous
              </button>
              <span className="notes-pagination-status">
                Page {pageNumber} of {pageCount}
                {total > 0 && ` (${total} notes)`}
              </span>
              <button
                type="button"
                className="notes-pagination-btn"
                disabled={pageNumber >= pageCount || list.loading}
                onClick={() => setPageNumber((current) => current + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </section>
    </>
  )
}

export default NotesPage
