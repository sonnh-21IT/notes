import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { noteSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { clearNoteDraft } from '@/admin/lib/noteDraft'
import { validateNoteFields } from '@/admin/lib/validation'
import {
  deleteNote,
  getNote,
  listCategories,
  listTags,
  upsertCategory,
  upsertNote,
  upsertTag,
} from '@/data/admin'
import { invalidateCategoriesList, invalidateTagsList } from '@/data/content'

import { todayIsoDate } from '@/utils/dates'

function findTagByName(tags, name) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null
  return tags.find((tag) => tag.name.toLowerCase() === normalized) ?? null
}

function snapshotFromFields(fields) {
  return noteSnapshot(fields)
}

export function useAdminNoteEditor() {
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
  const [pinned, setPinned] = useState(false)
  const [body, setBody] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(null)

  const isPreview = view === 'preview'
  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(body, isPreview)
  const categoryName = categories.find((item) => String(item.id) === categoryId)?.name ?? ''

  const applyDraft = useCallback((draft) => {
    setSlug(draft.slug ?? '')
    setTitle(draft.title ?? '')
    setSummary(draft.summary ?? '')
    setCategoryId(draft.categoryId != null ? String(draft.categoryId) : '')
    setSelectedTagIds(draft.tagIds ?? [])
    setPublishedAt(draft.publishedAt || todayIsoDate())
    setCoverImage(draft.coverImage ?? '')
    setPublished(draft.published ?? true)
    setPinned(draft.pinned ?? false)
    setBody(draft.body ?? '')
    return snapshotFromFields({
      slug: draft.slug ?? '',
      title: draft.title ?? '',
      summary: draft.summary ?? '',
      categoryId: draft.categoryId != null ? String(draft.categoryId) : '',
      selectedTagIds: draft.tagIds ?? [],
      publishedAt: draft.publishedAt || todayIsoDate(),
      coverImage: draft.coverImage ?? '',
      published: draft.published ?? true,
      pinned: draft.pinned ?? false,
      body: draft.body ?? '',
    })
  }, [])

  const currentSnapshot = useMemo(
    () => snapshotFromFields({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      publishedAt,
      coverImage,
      published,
      pinned,
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, publishedAt, coverImage, published, pinned, body],
  )

  useEffect(() => {
    let active = true

    Promise.all([
      listCategories(),
      listTags(),
      isNew ? Promise.resolve(null) : getNote(routeSlug),
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
          setPinned(note.pinned ?? false)
          setBody(note.body ?? '')
          setBaseline(snapshotFromFields({
            slug: note.slug,
            title: note.title,
            summary: note.summary,
            categoryId: note.categoryId != null ? String(note.categoryId) : '',
            selectedTagIds: note.tagIds ?? [],
            publishedAt: note.publishedAt || todayIsoDate(),
            coverImage: note.coverImage ?? '',
            published: note.published ?? true,
            pinned: note.pinned ?? false,
            body: note.body ?? '',
          }))
        } else {
          setBaseline(snapshotFromFields({
            slug: '',
            title: '',
            summary: '',
            categoryId: '',
            selectedTagIds: [],
            publishedAt: todayIsoDate(),
            coverImage: '',
            published: true,
            pinned: false,
            body: '',
          }))
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
  }, [isNew, routeSlug, location.state, applyDraft])

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

  const clearFieldError = useCallback((key) => {
    setFieldErrors((current) => (current[key] ? { ...current, [key]: '' } : current))
  }, [])

  const selectTag = useCallback((tagId) => {
    setSelectedTagIds((current) => (current.includes(tagId) ? current : [...current, tagId]))
  }, [])

  const toggleTag = useCallback((tagId) => {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((item) => item !== tagId) : [...current, tagId],
    )
  }, [])

  const removeTag = useCallback((tagId) => {
    setSelectedTagIds((current) => current.filter((item) => item !== tagId))
  }, [])

  const handleCreateCategory = useCallback(async (name) => {
    setCategoryFieldError('')
    setCreatingCategory(true)

    try {
      const created = await upsertCategory({ name })
      invalidateCategoriesList()
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(String(created.id))
    } catch (err) {
      setCategoryFieldError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setCreatingCategory(false)
    }
  }, [])

  const handleCreateTag = useCallback(async () => {
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
      const created = await upsertTag({ name: trimmedTagQuery })
      invalidateTagsList()
      setAllTags((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      selectTag(created.id)
      setTagQuery('')
    } catch (err) {
      setTagFieldError(err instanceof Error ? err.message : String(err))
    } finally {
      setCreatingTag(false)
    }
  }, [allTags, trimmedTagQuery, selectTag])

  const handleTagInputKeyDown = useCallback((event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (matchedExistingTag) {
      selectTag(matchedExistingTag.id)
      setTagQuery('')
      return
    }
    handleCreateTag()
  }, [matchedExistingTag, selectTag, handleCreateTag])

  const notePayload = useCallback(() => ({
    slug: slug.trim(),
    title: title.trim(),
    summary,
    categoryId: categoryId ? Number(categoryId) : null,
    tagIds: selectedTagIds,
    publishedAt: publishedAt || todayIsoDate(),
    coverImage: coverImage.trim() || null,
    published,
    pinned,
    body,
  }), [slug, title, summary, categoryId, selectedTagIds, publishedAt, coverImage, published, pinned, body])

  const runValidation = useCallback(() => {
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
  }, [slug, title, body, coverImage, published, publishedAt])

  const performSave = useCallback(async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = notePayload()
      await upsertNote(payload)
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
  }, [notePayload, currentSnapshot, isNew, navigate])

  const performDelete = useCallback(async () => {
    setSaving(true)
    setError('')

    try {
      await deleteNote(slug)
      navigate('/admin/notes', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
      setConfirm(null)
    }
  }, [slug, navigate])

  const handleShowPreview = useCallback(() => {
    setError('')
    setMessage('')
    setConfirm(null)

    if (!runValidation()) return

    setView('preview')
  }, [runValidation])

  const requestSave = useCallback(() => {
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
  }, [view, mdxError, runValidation, published, title, performSave])

  const handleDelete = useCallback(() => {
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
  }, [isNew, title, slug, performDelete])

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  return {
    loading,
    isNew,
    slug,
    title,
    view,
    isPreview,
    isDirty,
    saving,
    error,
    message,
    confirm,
    setConfirm,
    setView,
    mdxPreview: { MdxContent, loading: mdxLoading, error: mdxError },
    preview: {
      categoryName,
      selectedTags,
      publishedAt,
      coverImage,
      title,
    },
    form: {
      isNew,
      published,
      setPublished,
      pinned,
      setPinned,
      title,
      setTitle,
      slug,
      setSlug,
      summary,
      setSummary,
      categoryId,
      setCategoryId,
      coverImage,
      setCoverImage,
      body,
      setBody,
      categories,
      categoryFieldError,
      setCategoryFieldError,
      creatingCategory,
      handleCreateCategory,
      fieldErrors,
      clearFieldError,
      selectedTags,
      tagQuery,
      setTagQuery,
      tagFieldError,
      setTagFieldError,
      matchedExistingTag,
      canCreateTag,
      creatingTag,
      allTags,
      visibleTags,
      selectedTagIds,
      handleTagInputKeyDown,
      handleCreateTag,
      removeTag,
      toggleTag,
      selectTag,
    },
    requestSave,
    handleShowPreview,
    handleDelete,
  }
}
