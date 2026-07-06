import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import ArticleHeader from '@/content/components/ArticleHeader'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminEditorToolbar from '@/admin/components/AdminEditorToolbar'
import AdminFieldError from '@/admin/components/AdminFieldError'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminSelect from '@/admin/components/AdminSelect'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { fieldClassName, validateNoteFields } from '@/admin/lib/validation'
import { noteSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { clearNoteDraft } from '@/admin/lib/noteDraft'
import {
  adminDeleteNote,
  adminGetNote,
  adminListCategories,
  adminUpsertCategory,
  adminListTags,
  adminUpsertNote,
  adminUpsertTag,
} from '@/data/supabase/admin.provider'
import { slugify } from '@/utils/slugify'
import MdxBody from '@/content/mdx/MdxBody'

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function findTagByName(tags, name) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null
  return tags.find((tag) => tag.name.toLowerCase() === normalized) ?? null
}

function AdminNoteEditPage() {
  const { slug: routeSlug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isNew = routeSlug === 'new'
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(() => (location.state?.view === 'preview' ? 'preview' : 'edit'))
  const [saving, setSaving] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryFieldError, setCategoryFieldError] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [tagQuery, setTagQuery] = useState('')
  const [tagFieldError, setTagFieldError] = useState('')
  const [publishedAt, setPublishedAt] = useState(() => (isNew ? todayIsoDate() : ''))
  const [coverImage, setCoverImage] = useState('')
  const [published, setPublished] = useState(true)
  const [body, setBody] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(null)

  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(body, view === 'preview')
  const categoryName = categories.find((item) => String(item.id) === categoryId)?.name ?? ''

  function applyDraft(draft) {
    setSlug(draft.slug ?? '')
    setTitle(draft.title ?? '')
    setSummary(draft.summary ?? '')
    setCategoryId(draft.categoryId != null ? String(draft.categoryId) : '')
    setSelectedTagIds(draft.tagIds ?? [])
    setPublishedAt(draft.publishedAt || todayIsoDate())
    setCoverImage(draft.coverImage ?? '')
    setPublished(draft.published ?? true)
    setBody(draft.body ?? '')
    return noteSnapshot({
      slug: draft.slug ?? '',
      title: draft.title ?? '',
      summary: draft.summary ?? '',
      categoryId: draft.categoryId != null ? String(draft.categoryId) : '',
      selectedTagIds: draft.tagIds ?? [],
      publishedAt: draft.publishedAt || todayIsoDate(),
      coverImage: draft.coverImage ?? '',
      published: draft.published ?? true,
      body: draft.body ?? '',
      todayIsoDate,
    })
  }

  function snapshotFromNote(note) {
    return noteSnapshot({
      slug: note.slug,
      title: note.title,
      summary: note.summary,
      categoryId: note.categoryId != null ? String(note.categoryId) : '',
      selectedTagIds: note.tagIds ?? [],
      publishedAt: note.publishedAt || todayIsoDate(),
      coverImage: note.coverImage ?? '',
      published: note.published ?? true,
      body: note.body ?? '',
      todayIsoDate,
    })
  }

  function emptyNoteSnapshot() {
    return noteSnapshot({
      slug: '',
      title: '',
      summary: '',
      categoryId: '',
      selectedTagIds: [],
      publishedAt: todayIsoDate(),
      coverImage: '',
      published: true,
      body: '',
      todayIsoDate,
    })
  }

  const currentSnapshot = useMemo(
    () => noteSnapshot({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      publishedAt,
      coverImage,
      published,
      body,
      todayIsoDate,
    }),
    [slug, title, summary, categoryId, selectedTagIds, publishedAt, coverImage, published, body],
  )

  useEffect(() => {
    let active = true

    Promise.all([
      adminListCategories(),
      adminListTags(),
      isNew ? Promise.resolve(null) : adminGetNote(routeSlug),
    ])
      .then(([categoryRows, tagRows, note]) => {
        if (!active) return

        setCategories(categoryRows)
        setAllTags(tagRows)

        const draft = location.state?.draft
        if (draft?.editSlug === routeSlug) {
          setBaseline(applyDraft(draft))
        } else if (note) {
          setSlug(note.slug)
          setTitle(note.title)
          setSummary(note.summary)
          setCategoryId(note.categoryId != null ? String(note.categoryId) : '')
          setSelectedTagIds(note.tagIds ?? [])
          setPublishedAt(note.publishedAt || todayIsoDate())
          setCoverImage(note.coverImage ?? '')
          setPublished(note.published ?? true)
          setBody(note.body ?? '')
          setBaseline(snapshotFromNote(note))
        } else {
          setBaseline(emptyNoteSnapshot())
        }

        if (location.state?.view === 'preview') {
          setView('preview')
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isNew, routeSlug, location.state])

  const trimmedTagQuery = tagQuery.trim()
  const matchedExistingTag = useMemo(
    () => findTagByName(allTags, trimmedTagQuery),
    [allTags, trimmedTagQuery],
  )
  const canCreateTag = trimmedTagQuery.length > 0 && !matchedExistingTag

  const selectedTags = useMemo(
    () => allTags.filter((tag) => selectedTagIds.includes(tag.id)),
    [allTags, selectedTagIds],
  )

  const visibleTags = useMemo(() => {
    if (!trimmedTagQuery) return allTags
    const needle = trimmedTagQuery.toLowerCase()
    return allTags.filter((tag) => tag.name.toLowerCase().includes(needle))
  }, [allTags, trimmedTagQuery])

  function selectTag(tagId) {
    setSelectedTagIds((current) => (current.includes(tagId) ? current : [...current, tagId]))
  }

  function toggleTag(tagId) {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
    )
  }

  function removeTag(tagId) {
    setSelectedTagIds((current) => current.filter((item) => item !== tagId))
  }

  async function handleCreateCategory(name) {
    setCategoryFieldError('')
    setCreatingCategory(true)

    try {
      const created = await adminUpsertCategory({ name })
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(String(created.id))
    } catch (err) {
      setCategoryFieldError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleCreateTag() {
    setTagFieldError('')

    if (!trimmedTagQuery) {
      setTagFieldError('Enter a tag name.')
      return
    }

    const existing = findTagByName(allTags, trimmedTagQuery)
    if (existing) {
      selectTag(existing.id)
      setTagQuery('')
      return
    }

    setCreatingTag(true)
    try {
      const created = await adminUpsertTag({ name: trimmedTagQuery })
      setAllTags((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      selectTag(created.id)
      setTagQuery('')
    } catch (err) {
      setTagFieldError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreatingTag(false)
    }
  }

  function handleTagInputKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (matchedExistingTag) {
      selectTag(matchedExistingTag.id)
      setTagQuery('')
      return
    }
    handleCreateTag()
  }

  function notePayload() {
    return {
      slug: slug.trim(),
      title: title.trim(),
      summary,
      categoryId: categoryId ? Number(categoryId) : null,
      tagIds: selectedTagIds,
      publishedAt: publishedAt || todayIsoDate(),
      coverImage: coverImage.trim() || null,
      published,
      body,
    }
  }

  function runValidation() {
    const result = validateNoteFields({
      slug,
      title,
      body,
      coverImage,
      published,
      publishedAt,
    })
    setFieldErrors(result.errors)
    return result.valid
  }

  async function performSave() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = notePayload()
      await adminUpsertNote(payload)
      clearNoteDraft()
      setBaseline(currentSnapshot)
      setConfirm(null)
      setMessage('Note saved.')
      setView('edit')
      if (isNew) {
        navigate(`/admin/notes/${payload.slug}`, { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  async function performDelete() {
    setSaving(true)
    setError('')

    try {
      await adminDeleteNote(slug)
      navigate('/admin/notes', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
      setConfirm(null)
    }
  }

  function handleShowPreview() {
    setError('')
    setMessage('')
    setConfirm(null)

    if (!runValidation()) return

    setView('preview')
  }

  function requestSave() {
    setError('')
    setMessage('')

    if (view === 'preview' && mdxError) {
      setError('Fix MDX errors before saving.')
      return
    }

    if (!runValidation()) return

    setConfirm({
      kind: 'save',
      title: 'Save note?',
      description: published
        ? `"${title.trim()}" will be published on the public site.`
        : `"${title.trim()}" will be saved as a draft (not visible publicly).`,
      tone: 'warn',
      confirmLabel: 'Save note',
      onConfirm: performSave,
    })
  }

  function handleDelete() {
    if (isNew) return
    setError('')
    setMessage('')
    setConfirm({
      kind: 'delete',
      title: `Delete "${title.trim() || slug}"?`,
      description: 'This permanently removes the note from the database. This cannot be undone.',
      tone: 'danger',
      confirmLabel: 'Delete note',
      onConfirm: performDelete,
    })
  }

  if (loading) return <PageLoading label="Loading note" />

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  return (
    <div className="admin-page admin-page--editor">
      <p className="admin-breadcrumb">
        <Link to="/admin/notes">Notes</Link>
        <span aria-hidden="true"> / </span>
        {isNew ? 'New' : slug}
        {view === 'preview' && (
          <>
            <span aria-hidden="true"> / </span>
            Preview
          </>
        )}
      </p>

      <AdminPageHeader
        title={isNew ? 'New note' : title}
        description={
          view === 'preview'
            ? 'Preview how this note will look on the site.'
            : isNew
              ? 'Create a new article.'
              : 'Edit metadata and MDX body.'
        }
      />

      {view === 'preview' && (
        <div className="admin-preview-banner" role="status">
          Preview — not saved yet. Review below, then save or go back to edit.
        </div>
      )}

      {view === 'edit' ? (
        <form
          className="admin-form-body"
          onSubmit={(event) => {
            event.preventDefault()
            requestSave()
          }}
        >
        <section className="admin-section admin-note-status">
          <label className="admin-switch admin-switch--compact">
            <input
              type="checkbox"
              className="admin-switch-input"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              aria-label="Published"
            />
            <span className="admin-switch-track" aria-hidden="true">
              <span className="admin-switch-knob" />
            </span>
            <span className="admin-note-status-hint">
              {published ? 'Visible on the public site when saved.' : 'Saved as draft — hidden from the site.'}
            </span>
          </label>
        </section>

        <div className="admin-note-meta">
          <label className="admin-field admin-field--full">
            <span className="admin-label">Title</span>
            <input
              className={fieldClassName('admin-input', fieldErrors.title)}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (fieldErrors.title) setFieldErrors((current) => ({ ...current, title: '' }))
              }}
            />
            <AdminFieldError message={fieldErrors.title} />
          </label>

          <label className="admin-field">
            <span className="admin-label">Slug</span>
            <input
              className={fieldClassName('admin-input', fieldErrors.slug)}
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value))
                if (fieldErrors.slug) setFieldErrors((current) => ({ ...current, slug: '' }))
              }}
              readOnly={!isNew}
              placeholder={isNew ? 'my-new-note' : undefined}
            />
            <AdminFieldError message={fieldErrors.slug} />
          </label>

          <label className="admin-field">
            <span className="admin-label">Category</span>
            <AdminSelect
              value={categoryId}
              onChange={(next) => {
                setCategoryId(next)
                setCategoryFieldError('')
              }}
              options={[
                { value: '', label: 'None' },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                })),
              ]}
              creatable
              onCreate={handleCreateCategory}
              creating={creatingCategory}
              createError={categoryFieldError}
              emptyLabel="None"
            />
          </label>

          <label className="admin-field admin-field--full">
            <span className="admin-label">Summary</span>
            <textarea className="admin-textarea" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </label>

          <label className="admin-field admin-field--full">
            <span className="admin-label">Cover image URL</span>
            <input
              className={fieldClassName('admin-input', fieldErrors.coverImage)}
              value={coverImage}
              onChange={(e) => {
                setCoverImage(e.target.value)
                if (fieldErrors.coverImage) setFieldErrors((current) => ({ ...current, coverImage: '' }))
              }}
            />
            <AdminFieldError message={fieldErrors.coverImage} />
          </label>
        </div>

        <div className="admin-note-tags">
          <span className="admin-label">Tags</span>

          {selectedTags.length > 0 && (
            <div className="admin-tag-selected" aria-label="Tags on this note">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="admin-tag-chip">
                  {tag.name}
                  <button
                    type="button"
                    className="admin-tag-chip-remove"
                    aria-label={`Remove ${tag.name}`}
                    onClick={() => removeTag(tag.id)}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="admin-tag-composer">
            <input
              className="admin-input"
              placeholder="New tag name"
              value={tagQuery}
              onChange={(e) => {
                setTagQuery(e.target.value)
                setTagFieldError('')
              }}
              onKeyDown={handleTagInputKeyDown}
              disabled={creatingTag}
            />
            <button
              type="button"
              className="admin-tag-composer-btn"
              aria-label="Add tag to library"
              title="Add tag to library"
              disabled={!canCreateTag || creatingTag}
              onClick={handleCreateTag}
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>

          {matchedExistingTag ? (
            <p className="admin-field-hint">
              “{matchedExistingTag.name}” already exists —
              {' '}
              <button
                type="button"
                className="admin-inline-link"
                onClick={() => {
                  selectTag(matchedExistingTag.id)
                  setTagQuery('')
                }}
              >
                attach to this note
              </button>
            </p>
          ) : (
            <p className="admin-field-hint">
              Type a new name and press + to save it, then pick tags below.
            </p>
          )}

          {tagFieldError && <p className="admin-field-error">{tagFieldError}</p>}

          {allTags.length > 0 ? (
            <div className="admin-tag-options" role="group" aria-label="Available tags">
              {visibleTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`admin-tag-option${selected ? ' active' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                )
              })}
              {visibleTags.length === 0 && (
                <p className="admin-field-hint">No tags match your search.</p>
              )}
            </div>
          ) : (
            <p className="admin-field-hint">No tags yet. Create one above.</p>
          )}
        </div>

        <label className="admin-field admin-note-body">
          <span className="admin-label">Body (MDX)</span>
          <textarea
            className={fieldClassName('admin-textarea admin-textarea--code', fieldErrors.body)}
            rows={20}
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              if (fieldErrors.body) setFieldErrors((current) => ({ ...current, body: '' }))
            }}
          />
          <AdminFieldError message={fieldErrors.body} />
        </label>

        <AdminValidationSummary errors={fieldErrors} />
        </form>
      ) : (
        <div className="admin-preview-pane">
          {mdxLoading ? (
            <PageLoading label="Rendering preview" />
          ) : (
            <article className="page-stack content note-page admin-preview-article">
              <ArticleHeader
                title={title.trim() || 'Untitled'}
                publishedAt={publishedAt || todayIsoDate()}
                category={categoryName}
                coverImage={coverImage || null}
                tags={selectedTags.map((tag) => tag.name)}
              />
              {mdxError ? (
                <AdminFlash type="error">MDX error: {mdxError}</AdminFlash>
              ) : (
                <MdxBody component={MdxContent} />
              )}
            </article>
          )}
        </div>
      )}

      <AdminFlash type="error">{error}</AdminFlash>
      <AdminFlash type="success">{message}</AdminFlash>

      {confirm && (
        <AdminConfirmPanel
          title={confirm.title}
          description={confirm.description}
          tone={confirm.tone}
          confirmLabel={confirm.confirmLabel}
          cancelLabel="Cancel"
          loading={saving}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}

      <AdminEditorToolbar
        mode={view}
        onShowPreview={handleShowPreview}
        onBackToEdit={() => {
          setConfirm(null)
          setView('edit')
        }}
        onSave={requestSave}
        saveLabel="Save note"
        saving={saving}
        disabled={Boolean(confirm)}
        saveDisabled={!isDirty || (view === 'preview' && mdxLoading)}
        extra={
          view === 'edit' && !isNew ? (
            <button
              type="button"
              className="admin-button admin-button--danger"
              onClick={handleDelete}
              disabled={saving || Boolean(confirm)}
            >
              Delete
            </button>
          ) : null
        }
      />
    </div>
  )
}

export default AdminNoteEditPage
