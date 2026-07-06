import { useEffect, useMemo, useState } from 'react'
import { Folder, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import MdxBody from '@/content/mdx/MdxBody'
import PageLoadState from '@/ui/PageLoadState'
import { useCategoriesList, useNotesPage, usePageContent, useTagsList } from '@/hooks/usePageContent'
import { formatArticleDate } from '@/utils/formatArticleMeta'

const NOTES_PAGE_SIZE = 10

function FilterKindIcon({ kind, className = 'notes-filter-kind-icon' }) {
  const Icon = kind === 'category' ? Folder : Tag
  return <Icon className={className} aria-hidden="true" size={12} strokeWidth={2} />
}

function NotesPage() {
  const page = usePageContent('notes')
  const tags = useTagsList()
  const categories = useCategoriesList()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTagIds, setActiveTagIds] = useState([])
  const [activeCategoryIds, setActiveCategoryIds] = useState([])
  const [pageNumber, setPageNumber] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setPageNumber(1)
  }, [debouncedQuery, activeTagIds, activeCategoryIds])

  const list = useNotesPage({
    page: pageNumber,
    pageSize: NOTES_PAGE_SIZE,
    query: debouncedQuery,
    tagIds: activeTagIds,
    categoryIds: activeCategoryIds,
  })

  const initialLoading = page.loading || tags.loading || categories.loading
  const initialError = page.error ?? tags.error ?? categories.error
  const notesPageContent = page.data
  const allTags = tags.data ?? []
  const allCategories = categories.data ?? []
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

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0

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

  return (
    <PageLoadState loading={initialLoading} error={initialError}>
      <section className="page-stack content notes-page">
        <MdxBody component={notesPageContent?.MdxContent} />

        <section className="content-section notes-list-section" aria-label="Notes list">
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

            {filterOptions.length > 0 && (
              <div className="notes-tag-filters notes-tag-filters--scroll" role="group" aria-label="Filter by category and tag">
                {filterOptions.map((option) => (
                  <button
                    key={`${option.kind}-${option.id}`}
                    type="button"
                    className="notes-tag-filter"
                    aria-label={`${option.kind === 'category' ? 'Category' : 'Tag'}: ${option.name}`}
                    onClick={() => selectFilter(option)}
                  >
                    <FilterKindIcon kind={option.kind} />
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="notes-active-filters" aria-label="Active filters">
              {selectedCategories.map((category) => (
                <button
                  key={`category-${category.id}`}
                  type="button"
                  className="notes-active-filter"
                  aria-label={`Remove category: ${category.name}`}
                  onClick={() => setActiveCategoryIds((current) => current.filter((id) => id !== category.id))}
                >
                  <FilterKindIcon kind="category" />
                  {category.name}
                  <span className="notes-active-filter-remove" aria-hidden="true">×</span>
                </button>
              ))}
              {selectedTags.map((tag) => (
                <button
                  key={`tag-${tag.id}`}
                  type="button"
                  className="notes-active-filter"
                  aria-label={`Remove tag: ${tag.name}`}
                  onClick={() => setActiveTagIds((current) => current.filter((id) => id !== tag.id))}
                >
                  <FilterKindIcon kind="tag" />
                  {tag.name}
                  <span className="notes-active-filter-remove" aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}

          {listError && <p className="notes-empty">{listError.message}</p>}

          {!listError && notes.length === 0 && !list.loading ? (
            <p className="notes-empty">No notes match your search.</p>
          ) : (
            <ul className={`content-list${list.loading ? ' content-list--loading' : ''}`} aria-busy={list.loading}>
              {notes.map((note) => {
                const meta = [formatArticleDate(note.publishedAt), note.category]
                  .filter(Boolean)
                  .join(' • ')

                return (
                  <li key={note.slug} className="content-list-item">
                    <Link className="content-link" to={`/notes/${note.slug}`}>
                      {note.title}
                    </Link>
                    {meta && <span className="content-list-meta">{meta}</span>}
                    <p className="content-list-summary">{note.summary}</p>
                  </li>
                )
              })}
            </ul>
          )}

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
    </PageLoadState>
  )
}

export default NotesPage
