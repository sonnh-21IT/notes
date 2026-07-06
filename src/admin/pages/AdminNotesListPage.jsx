import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Folder, Plus, Tag } from 'lucide-react'
import PageLoading from '@/ui/PageLoading'
import AdminEmptyState from '@/admin/components/AdminEmptyState'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminListItem from '@/admin/components/AdminListItem'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import { adminListCategories, adminListNotes, adminListTags } from '@/data/supabase/admin.provider'
import { formatArticleDate } from '@/utils/formatArticleMeta'

const NOTES_PAGE_SIZE = 10
const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
]

function FilterKindIcon({ kind, className = 'notes-filter-kind-icon' }) {
  const Icon = kind === 'category' ? Folder : Tag
  return <Icon className={className} aria-hidden="true" size={12} strokeWidth={2} />
}

function noteMeta(note) {
  const parts = [formatArticleDate(note.publishedAt), note.category, note.slug].filter(Boolean)
  return parts.join(' · ')
}

function AdminNotesListPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeCategoryIds, setActiveCategoryIds] = useState([])
  const [activeTagIds, setActiveTagIds] = useState([])
  const [pageNumber, setPageNumber] = useState(1)

  useEffect(() => {
    Promise.all([adminListNotes(), adminListTags(), adminListCategories()])
      .then(([notesData, tagsData, categoriesData]) => {
        setNotes(notesData)
        setTags(tagsData)
        setCategories(categoriesData)
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  const publishedCount = notes.filter((note) => note.published).length
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
    const normalizedQuery = query.trim().toLowerCase()

    return notes.filter((note) => {
      if (statusFilter === 'published' && !note.published) return false
      if (statusFilter === 'draft' && note.published) return false
      if (activeCategoryIds.length && !activeCategoryIds.includes(note.categoryId)) return false
      if (activeTagIds.length && !activeTagIds.some((id) => note.tagIds?.includes(id))) return false
      if (!normalizedQuery) return true

      return [note.title, note.slug, note.summary, note.category, ...(note.tags ?? [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    })
  }, [notes, query, statusFilter, activeCategoryIds, activeTagIds])
  const pageCount = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PAGE_SIZE))
  const pagedNotes = useMemo(() => {
    const start = (pageNumber - 1) * NOTES_PAGE_SIZE
    return filteredNotes.slice(start, start + NOTES_PAGE_SIZE)
  }, [filteredNotes, pageNumber])

  useEffect(() => {
    setPageNumber(1)
  }, [query, statusFilter, activeCategoryIds, activeTagIds])

  useEffect(() => {
    if (pageNumber > pageCount) setPageNumber(pageCount)
  }, [pageNumber, pageCount])

  function selectFilter(option) {
    if (option.kind === 'category') {
      setActiveCategoryIds((current) => [...current, option.id])
      return
    }

    setActiveTagIds((current) => [...current, option.id])
  }

  if (loading) return <PageLoading label="Loading notes" />

  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0

  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="Notes"
        title="Articles"
        description={
          notes.length
            ? `${notes.length} total · ${publishedCount} published`
            : 'Write and publish blog posts.'
        }
        action={(
          <Link className="admin-button admin-button--primary" to="/admin/notes/new">
            <Plus size={16} aria-hidden="true" />
            New note
          </Link>
        )}
      />

      <AdminFlash type="error">{error}</AdminFlash>

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
            <div className="admin-list-toolbar" role="search">
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

              <div className="admin-status-filter" role="group" aria-label="Filter by status">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`admin-status-chip${statusFilter === option.value ? ' is-active' : ''}`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
                  <AdminListItem
                    key={note.slug}
                    to={`/admin/notes/${note.slug}`}
                    title={note.title}
                    meta={noteMeta(note)}
                    badge={
                      note.published
                        ? <span className="admin-badge admin-badge--live">Published</span>
                        : <span className="admin-badge admin-badge--draft">Draft</span>
                    }
                  />
                ))}
              </ul>
              <div className="admin-list-pagination" aria-label="Notes pagination">
                <button
                  type="button"
                  className="admin-button admin-button--ghost admin-button--sm"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((current) => current - 1)}
                >
                  Previous
                </button>
                <span className="admin-list-pagination-status">
                  Page {pageNumber} of {pageCount}
                  {filteredNotes.length > 0 && ` (${filteredNotes.length} notes)`}
                </span>
                <button
                  type="button"
                  className="admin-button admin-button--ghost admin-button--sm"
                  disabled={pageNumber >= pageCount}
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
