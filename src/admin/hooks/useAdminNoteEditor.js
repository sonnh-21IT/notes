import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { noteDirtySnapshot, noteHasUserContent, snapshotEquals } from '@/admin/lib/formDirty'
import { noteFlagsToastMessage } from '@/admin/lib/noteFlags'
import { clearNoteDraft } from '@/admin/lib/noteDraft'
import { isValidNoteSlug, validateNoteFields } from '@/admin/lib/validation'
import {
  deleteCoverImage,
  deleteNote,
  getNote,
  listCategories,
  listTags,
  updateNoteFlags,
  uploadCoverImage,
  upsertCategory,
  upsertNote,
  upsertTag,
} from '@/data/admin'
import { invalidateCategoriesList, invalidateTagsList } from '@/data/content'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

import { todayIsoDate } from '@/utils/dates'
import { sanitizeSlugInput, slugify } from '@/utils/slugify'

function findTagByName(tags, name) {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return null
  return tags.find((tag) => tag.name.toLowerCase() === normalized) ?? null
}

function snapshotFromFields(fields) {
  return noteDirtySnapshot(fields)
}

function emptyNoteFormFields() {
  return {
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
  }
}

function draftToFields(draft) {
  return {
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
  }
}

function noteToFields(note) {
  return {
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
  }
}

function readInitialNoteFields(routeSlug, locationState) {
  if (routeSlug !== 'new') return emptyNoteFormFields()

  const draft = locationState?.draft
  if (draft?.editSlug === routeSlug) return draftToFields(draft)

  return emptyNoteFormFields()
}

function readInitialSlugManual(routeSlug, locationState) {
  if (routeSlug !== 'new') return false

  const draft = locationState?.draft
  if (draft?.editSlug !== routeSlug) return false

  const draftSlug = (draft.slug ?? '').trim()
  return Boolean(draftSlug && draftSlug !== slugify(draft.title ?? ''))
}

export function useAdminNoteEditor() {
  const { slug: routeSlug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useAdminToast()
  const saveInFlightRef = useRef(false)
  const togglingFlagsRef = useRef(false)
  const slugCheckRef = useRef(0)
  const sessionCoverUploadsRef = useRef(new Set())
  const coverImageRef = useRef('')
  const isNew = routeSlug === 'new'
  const initialFields = readInitialNoteFields(routeSlug, location.state)

  const [loading, setLoading] = useState(() => routeSlug !== 'new')
  const [view, setView] = useState(() => (location.state?.view === 'preview' ? 'preview' : 'edit'))
  const [creatingTag, setCreatingTag] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryFieldError, setCategoryFieldError] = useState('')
  const [categories, setCategories] = useState([])
  const [allTags, setAllTags] = useState([])
  const [slug, setSlug] = useState(() => (isNew ? initialFields.slug : ''))
  const [title, setTitle] = useState(() => (isNew ? initialFields.title : ''))
  const [summary, setSummary] = useState(() => (isNew ? initialFields.summary : ''))
  const [categoryId, setCategoryId] = useState(() => (isNew ? initialFields.categoryId : ''))
  const [selectedTagIds, setSelectedTagIds] = useState(() => (isNew ? initialFields.selectedTagIds : []))
  const [tagQuery, setTagQuery] = useState('')
  const [tagFieldError, setTagFieldError] = useState('')
  const [publishedAt, setPublishedAt] = useState(() => (isNew ? initialFields.publishedAt : ''))
  const [coverImage, setCoverImage] = useState(() => (isNew ? initialFields.coverImage : ''))
  const [coverUploading, setCoverUploading] = useState(false)
  const [published, setPublished] = useState(() => (isNew ? initialFields.published : true))
  const [pinned, setPinned] = useState(() => (isNew ? initialFields.pinned : false))
  const [body, setBody] = useState(() => (isNew ? initialFields.body : ''))
  const [fieldErrors, setFieldErrors] = useState({})
  const [slugCheckResult, setSlugCheckResult] = useState({ key: '', result: null })
  const [slugManual, setSlugManual] = useState(() => readInitialSlugManual(routeSlug, location.state))
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(() => (isNew ? snapshotFromFields(initialFields) : null))

  coverImageRef.current = coverImage

  const isPreview = view === 'preview'
  const debouncedSlug = useDebouncedValue(slug, 400)
  const slugStatus = useMemo(() => {
    if (!isNew) return null

    const trimmed = slug.trim()
    if (!trimmed) return null
    if (!isValidNoteSlug(trimmed)) return 'unavailable'

    const debouncedTrimmed = debouncedSlug.trim()
    if (!isValidNoteSlug(debouncedTrimmed)) return 'unavailable'

    if (slugCheckResult.key !== debouncedTrimmed) return null
    if (slugCheckResult.result === 'available') return 'available'
    if (slugCheckResult.result === 'taken') return 'unavailable'
    return null
  }, [isNew, slug, debouncedSlug, slugCheckResult])
  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(body, isPreview)
  const categoryName = categories.find((item) => String(item.id) === categoryId)?.name ?? ''

  const applyNoteFields = useCallback((fields) => {
    setSlug(fields.slug)
    setTitle(fields.title)
    setSummary(fields.summary)
    setCategoryId(fields.categoryId)
    setSelectedTagIds(fields.selectedTagIds)
    setPublishedAt(fields.publishedAt)
    setCoverImage(fields.coverImage)
    setPublished(fields.published)
    setPinned(fields.pinned)
    setBody(fields.body)
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
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, publishedAt, coverImage, body],
  )

  useEffect(() => {
    if (!isNew) return

    let active = true

    Promise.all([listCategories(), listTags()])
      .then(([categoryRows, tagRows]) => {
        if (!active) return
        setCategories(categoryRows)
        setAllTags(tagRows)
      })
      .catch((err) => {
        if (active) toast.showError(err instanceof Error ? err.message : String(err))
      })

    return () => {
      active = false
    }
  }, [isNew, routeSlug, location.state?.draft, toast])

  useEffect(() => {
    if (isNew) return

    let active = true
    const draft = location.state?.draft

    Promise.all([
      listCategories(),
      listTags(),
      getNote(routeSlug),
    ])
      .then(([categoryRows, tagRows, note]) => {
        if (!active) return

        setCategories(categoryRows)
        setAllTags(tagRows)

        if (draft?.editSlug === routeSlug) {
          const fields = draftToFields(draft)
          applyNoteFields(fields)
          setBaseline(snapshotFromFields(fields))
        } else if (note) {
          const fields = noteToFields(note)
          applyNoteFields(fields)
          setBaseline(snapshotFromFields(fields))
        } else {
          setBaseline(snapshotFromFields(emptyNoteFormFields()))
        }

        if (location.state?.view === 'preview') {
          setView('preview')
        }
      })
      .catch((err) => {
        if (active) toast.showError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isNew, routeSlug, location.state?.draft, location.state?.view, applyNoteFields, toast])

  useEffect(() => {
    if (!isNew) return undefined

    const trimmed = debouncedSlug.trim()
    if (!trimmed || !isValidNoteSlug(trimmed)) return undefined

    let active = true
    const checkId = ++slugCheckRef.current

    getNote(trimmed)
      .then((note) => {
        if (!active || slugCheckRef.current !== checkId) return
        setSlugCheckResult({
          key: trimmed,
          result: note ? 'taken' : 'available',
        })
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [isNew, debouncedSlug])

  useEffect(() => {
    const sessionUploads = sessionCoverUploadsRef.current
    return () => {
      for (const url of sessionUploads) {
        deleteCoverImage(url).catch(() => {})
      }
      sessionUploads.clear()
    }
  }, [])

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

  const handleTitleChange = useCallback((value) => {
    setTitle(value)
    clearFieldError('title')
    if (isNew && !slugManual) {
      setSlug(slugify(value))
      clearFieldError('slug')
    }
  }, [isNew, slugManual, clearFieldError])

  const handleSlugChange = useCallback((value) => {
    setSlugManual(true)
    setSlug(sanitizeSlugInput(value))
    clearFieldError('slug')
  }, [clearFieldError])

  const refreshSlugFromTitle = useCallback(() => {
    setSlugManual(false)
    setSlug(slugify(title))
    clearFieldError('slug')
  }, [title, clearFieldError])

  const handleCoverSelect = useCallback(async (file) => {
    const previous = coverImageRef.current
    setCoverUploading(true)
    clearFieldError('coverImage')

    try {
      const url = await uploadCoverImage(file)
      sessionCoverUploadsRef.current.add(url)
      setCoverImage(url)

      if (previous && sessionCoverUploadsRef.current.has(previous)) {
        sessionCoverUploadsRef.current.delete(previous)
        deleteCoverImage(previous).catch(() => {})
      }
    } catch (err) {
      setFieldErrors((current) => ({
        ...current,
        coverImage: err instanceof Error ? err.message : String(err),
      }))
    } finally {
      setCoverUploading(false)
    }
  }, [clearFieldError])

  const handleCoverRemove = useCallback(() => {
    const previous = coverImageRef.current
    setCoverImage('')
    clearFieldError('coverImage')

    if (previous && sessionCoverUploadsRef.current.has(previous)) {
      sessionCoverUploadsRef.current.delete(previous)
      deleteCoverImage(previous).catch(() => {})
    }
  }, [clearFieldError])

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
      summary,
      body,
      coverImage,
      publishedAt,
    })
    setFieldErrors(result.errors)
    return result.valid
  }, [slug, title, summary, body, coverImage, publishedAt])

  const validateSlugAvailable = useCallback(async () => {
    if (!isNew) return true

    const trimmed = slug.trim()
    if (!isValidNoteSlug(trimmed)) return true

    try {
      const existing = await getNote(trimmed)
      if (existing) {
        setSlugCheckResult({ key: trimmed, result: 'taken' })
        return false
      }
      return true
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
      return false
    }
  }, [isNew, slug, toast])

  const performSave = useCallback(async () => {
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      if (!(await validateSlugAvailable())) return

      const previousCover = baseline?.coverImage ?? null
      const payload = notePayload()
      await upsertNote(payload)

      if (previousCover && previousCover !== payload.coverImage) {
        await deleteCoverImage(previousCover).catch(() => {})
      }

      if (payload.coverImage) {
        sessionCoverUploadsRef.current.delete(payload.coverImage)
      }
      sessionCoverUploadsRef.current.clear()

      clearNoteDraft()
      setBaseline(currentSnapshot)
      toast.showSuccess('Note saved.')
      setView('edit')
      if (isNew) {
        navigate(`/admin/notes/${payload.slug}`, { replace: true })
      }
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      saveInFlightRef.current = false
    }
  }, [notePayload, currentSnapshot, baseline, isNew, navigate, toast, validateSlugAvailable])

  const performDelete = useCallback(async () => {
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      await deleteNote(slug)
      navigate('/admin/notes', { replace: true })
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
      saveInFlightRef.current = false
    }
  }, [slug, navigate, toast])

  const handleShowPreview = useCallback(async () => {
    setConfirm(null)

    if (!runValidation()) return
    if (!(await validateSlugAvailable())) return

    setView('preview')
  }, [runValidation, validateSlugAvailable])

  const requestSave = useCallback(async () => {
    setConfirm(null)

    if (view === 'preview' && mdxError) {
      toast.showError('Fix MDX errors before saving.')
      return
    }

    if (!runValidation()) return
    if (!(await validateSlugAvailable())) return

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
  }, [view, mdxError, runValidation, validateSlugAvailable, published, title, performSave, toast])

  const handleDelete = useCallback(() => {
    if (isNew) return
    setConfirm({
      kind: 'delete',
      title: `Delete "${title.trim() || slug}"?`,
      description: 'This permanently removes the note from the database. This cannot be undone.',
      tone: 'danger',
      confirmLabel: 'Delete note',
      onConfirm: performDelete,
    })
  }, [isNew, title, slug, performDelete])

  const patchNoteFlags = useCallback(async (patch) => {
    if (isNew || !slug.trim() || togglingFlagsRef.current) return

    const previous = { published, pinned }
    togglingFlagsRef.current = true

    if (patch.published !== undefined) setPublished(patch.published)
    if (patch.pinned !== undefined) setPinned(patch.pinned)

    try {
      const result = await updateNoteFlags({ slug: slug.trim(), ...patch })
      setPublished(result.published)
      setPinned(result.pinned)
      toast.showSuccess(noteFlagsToastMessage(patch))
    } catch (err) {
      setPublished(previous.published)
      setPinned(previous.pinned)
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      togglingFlagsRef.current = false
    }
  }, [isNew, slug, published, pinned, toast])

  const togglePublished = useCallback(() => {
    if (isNew) {
      setPublished((value) => !value)
      return
    }
    patchNoteFlags({ published: !published })
  }, [isNew, patchNoteFlags, published])

  const togglePinned = useCallback(() => {
    if (isNew) {
      setPinned((value) => !value)
      return
    }
    patchNoteFlags({ pinned: !pinned })
  }, [isNew, patchNoteFlags, pinned])

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  const hasUserContent = useMemo(
    () => noteHasUserContent({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      coverImage,
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, coverImage, body],
  )

  const slugSaveBlocked = isNew && Boolean(slug.trim()) && slugStatus !== 'available'

  const saveDisabled = !isDirty
    || coverUploading
    || (isPreview && mdxLoading)
    || (isNew && (!hasUserContent || slugSaveBlocked))

  return {
    loading,
    isNew,
    slug,
    title,
    published,
    pinned,
    view,
    isPreview,
    isDirty,
    saveDisabled,
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
      title,
      handleTitleChange,
      slug,
      handleSlugChange,
      refreshSlugFromTitle,
      slugStatus,
      summary,
      setSummary,
      categoryId,
      setCategoryId,
      coverImage,
      coverUploading,
      handleCoverSelect,
      handleCoverRemove,
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
      published,
      pinned,
      onTogglePublished: togglePublished,
      onTogglePinned: togglePinned,
    },
    requestSave,
    handleShowPreview,
    handleDelete,
    togglePublished,
    togglePinned,
  }
}
