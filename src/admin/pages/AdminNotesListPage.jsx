import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { NotesActiveFilters, NotesFilterOptions } from '@/shared/notes/NotesFilterBar'
import PageLoading from '@/ui/PageLoading'
import AdminEmptyState from '@/admin/components/AdminEmptyState'
import AdminNoteListItem from '@/admin/components/AdminNoteListItem'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import { useAdminNotesCatalog } from '@/admin/hooks/useAdminNotesCatalog'
import { noteFlagsToastMessage } from '@/admin/lib/noteFlags'
import { getAuthUserId, isSiteOwner, updateNoteFlags } from '@/data/admin'
import { usePaginationState } from '@/hooks/usePaginationState'
import { formatArticleDate } from '@/utils/formatArticleMeta'

const NOTES_PAGE_SIZE = 10
const listFilterOptions = [
  { value: 'all', label: 'All' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'published', label: 'Published' },
]

function noteMeta(note) {
  const parts = [
    formatArticleDate(note.publishedAt),
    note.category,
    note.slug,
  ].filter(Boolean)
  return parts.join(' · ')
}

function AdminNotesListPage() {
  const toast = useAdminToast()
  const togglingRef = useRef(false)
  const { loading, error, data } = useAdminNotesCatalog()
  const catalogNotes = useMemo(() => data?.notes ?? [], [data?.notes])
  const [overrides, setOverrides] = useState({})
  const notes = useMemo(
    () => catalogNotes.map((note) => ({ ...note, ...overrides[note.slug] })),
    [catalogNotes, overrides],
  )
  const categories = useMemo(() => data?.categories ?? [], [data?.categories])
  const tags = useMemo(() => data?.tags ?? [], [data?.tags])
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [listFilter, setListFilter] = useState('all')
  const [activeCategoryIds, setActiveCategoryIds] = useState([])
  const [activeTagIds, setActiveTagIds] = useState([])
  const filterKey = `${deferredQuery}\0${listFilter}\0${activeCategoryIds.join()}\0${activeTagIds.join()}`
  const { pageNumber, setPageNumber } = usePaginationState(filterKey)

  useEffect(() => {
    let active = true

    Promise.all([isSiteOwner(), getAuthUserId()])
      .then(([canWrite, userId]) => {
        if (!active || canWrite !== false || !userId) return
        toast.showError(
          `Signed in as ${userId}, but this account is not the site owner in Supabase. `
          + 'Update is_site_owner() in the SQL editor with this UUID.',
        )
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [toast])

  useEffect(() => {
    if (error?.message) toast.showError(error.message)
  }, [error, toast])

  const publishedCount = notes.filter((note) => note.published).length
  const pinnedCount = notes.filter((note) => note.pinned).length
  const selectedCategories = useMemo(
    () => categories.filter((category) => activeCategoryIds.includes(category.id)),
    [categories, activeCategoryIds],
  )
  const selectedTags = useMemo(
    () => tags.filter((tag) => activeTagIds.includes(tag.id)),
    [tags, activeTagIds],
  )
  const filterOptions = useMemo(
    () => [
      ...categories
        .filter((category) => !activeCategoryIds.includes(category.id))
        .map((category) => ({ kind: 'category', id: category.id, name: category.name })),
      ...tags
        .filter((tag) => !activeTagIds.includes(tag.id))
        .map((tag) => ({ kind: 'tag', id: tag.id, name: tag.name })),
    ],
    [categories, tags, activeCategoryIds, activeTagIds],
  )
  const filteredNotes = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return notes.filter((note) => {
      if (listFilter === 'published' && !note.published) return false
      if (listFilter === 'pinned' && !note.pinned) return false
      if (activeCategoryIds.length && !activeCategoryIds.includes(note.categoryId)) return false
      if (activeTagIds.length && !activeTagIds.some((id) => note.tagIds?.includes(id))) return false
      if (!normalizedQuery) return true

      return [note.title, note.slug, note.summary, note.category, ...(note.tags ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    })
  }, [notes, deferredQuery, listFilter, activeCategoryIds, activeTagIds])
  const pageCount = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PAGE_SIZE))
  const safePageNumber = Math.min(pageNumber, pageCount)
  const pagedNotes = useMemo(() => {
    const start = (safePageNumber - 1) * NOTES_PAGE_SIZE
    return filteredNotes.slice(start, start + NOTES_PAGE_SIZE)
  }, [filteredNotes, safePageNumber])

  function selectFilter(option) {
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

  async function patchNoteFlags(slug, patch) {
    if (togglingRef.current) return

    const previous = notes.find((note) => note.slug === slug)
    if (!previous) return

    togglingRef.current = true
    setOverrides((current) => ({
      ...current,
      [slug]: { ...current[slug], ...patch },
    }))

    try {
      const result = await updateNoteFlags({ slug, ...patch })
      setOverrides((current) => ({
        ...current,
        [slug]: { ...current[slug], published: result.published, pinned: result.pinned },
      }))
      toast.showSuccess(noteFlagsToastMessage(patch))
    } catch (err) {
      setOverrides((current) => {
        const next = { ...current, [slug]: { ...current[slug] } }
        for (const key of Object.keys(patch)) {
          next[slug][key] = previous[key]
        }
        return next
      })
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      togglingRef.current = false
    }
  }

  function togglePublished(note) {
    patchNoteFlags(note.slug, { published: !note.published })
  }

  function togglePinned(note) {
    patchNoteFlags(note.slug, { pinned: !note.pinned })
  }

  if (loading) return <PageLoading label="Loading notes" />

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Notes"
        title="Articles"
        description={
          notes.length
            ? `${notes.length} total · ${publishedCount} published · ${pinnedCount} pinned`
            : 'Write and publish blog posts.'
        }
        action={(
          <Link className="admin-button admin-button--primary" to="/admin/notes/new">
            <Plus size={16} aria-hidden="true" />
            New note
          </Link>
        )}
      />

      {notes.length === 0 ? (
        <AdminEmptyState
          title="No notes yet"
          description="Create your first article, preview it, then save when ready."
          action={(
            <Link className="admin-button admin-button--primary" to="/admin/notes/new">
              <Plus size={16} aria-hidden="true" />
              New note
            </Link>
          )}
        />
      ) : (
        <>
          <div className="admin-list-controls">
            <div className="admin-list-toolbar" role="search" aria-busy={query !== deferredQuery}>
              <label className="admin-list-search">
                <span className="visually-hidden">Search notes</span>
                <input
                  type="search"
                  className="admin-input"
                  placeholder="Search notes..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>

              <div className="admin-status-filter" role="group" aria-label="Filter notes">
                {listFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`admin-status-chip${listFilter === option.value ? ' is-active' : ''}`}
                    onClick={() => setListFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <NotesFilterOptions filterOptions={filterOptions} onSelect={selectFilter} />

            <NotesActiveFilters
              selectedCategories={selectedCategories}
              selectedTags={selectedTags}
              onRemove={removeFilter}
            />
          </div>

          {filteredNotes.length === 0 ? (
            <AdminEmptyState
              title="No notes match your filters"
              description="Try a different search keyword or reset filters."
            />
          ) : (
            <>
              <ul className="admin-list">
                {pagedNotes.map((note) => (
                  <AdminNoteListItem
                    key={note.slug}
                    note={note}
                    meta={noteMeta(note)}
                    onTogglePublished={togglePublished}
                    onTogglePinned={togglePinned}
                  />
                ))}
              </ul>
              <div className="admin-list-pagination" aria-label="Notes pagination">
                <button
                  type="button"
                  className="admin-button admin-button--ghost admin-button--sm"
                  disabled={safePageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                >
                  Previous
                </button>
                <span className="admin-list-pagination-status">
                  Page {safePageNumber} of {pageCount}
                  {filteredNotes.length > 0 && ` (${filteredNotes.length} notes)`}
                </span>
                <button
                  type="button"
                  className="admin-button admin-button--ghost admin-button--sm"
                  disabled={safePageNumber >= pageCount}
                  onClick={() => setPageNumber((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AdminNotesListPage
