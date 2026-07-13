import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNoteCatalog } from '@/admin/hooks/noteEditor/useNoteCatalog'
import { useNoteCover } from '@/admin/hooks/noteEditor/useNoteCover'
import { noteHasUserContent, snapshotEquals } from '@/admin/lib/formDirty'
import {
  draftToFields,
  emptyNoteFormFields,
  noteToFields,
  readInitialNoteFields,
  readInitialSlugManual,
  snapshotFromFields,
} from '@/admin/lib/noteEditorModel'
import { isValidNoteSlug } from '@/admin/lib/validation'
import { getNote } from '@/data/admin'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { sanitizeSlugInput, slugify } from '@/utils/slugify'

/** Form fields, catalog/cover, load + slug availability for the note editor. */
export function useNoteEditorForm({ routeSlug, location, toast }) {
  const slugCheckRef = useRef(0)
  const isNew = routeSlug === 'new'
  const initialFields = readInitialNoteFields(routeSlug, location.state)

  const [loading, setLoading] = useState(() => routeSlug !== 'new')
  const [editorSlug, setEditorSlug] = useState(routeSlug)
  const [view, setView] = useState(() => (location.state?.view === 'preview' ? 'preview' : 'edit'))
  const [slug, setSlug] = useState(() => (isNew ? initialFields.slug : ''))
  const [title, setTitle] = useState(() => (isNew ? initialFields.title : ''))
  const [summary, setSummary] = useState(() => (isNew ? initialFields.summary : ''))
  const [categoryId, setCategoryId] = useState(() => (isNew ? initialFields.categoryId : ''))
  const [selectedTagIds, setSelectedTagIds] = useState(() => (isNew ? initialFields.selectedTagIds : []))
  const [publishedAt, setPublishedAt] = useState(() => (isNew ? initialFields.publishedAt : ''))
  const [published, setPublished] = useState(() => (isNew ? initialFields.published : true))
  const [pinned, setPinned] = useState(() => (isNew ? initialFields.pinned : false))
  const [body, setBody] = useState(() => (isNew ? initialFields.body : ''))
  const [fieldErrors, setFieldErrors] = useState({})
  const [slugCheckResult, setSlugCheckResult] = useState({ key: '', result: null })
  const [slugManual, setSlugManual] = useState(() => readInitialSlugManual(routeSlug, location.state))
  const [baseline, setBaseline] = useState(() => (isNew ? snapshotFromFields(initialFields) : null))

  // Reset loading when navigating between note routes (avoid setState-in-effect).
  if (editorSlug !== routeSlug) {
    setEditorSlug(routeSlug)
    setLoading(routeSlug !== 'new')
  }

  const clearFieldError = useCallback((key) => {
    setFieldErrors((current) => (current[key] ? { ...current, [key]: '' } : current))
  }, [])

  const cover = useNoteCover({
    initialCoverImage: isNew ? initialFields.coverImage : '',
    clearFieldError,
    setFieldErrors,
  })

  const catalog = useNoteCatalog({
    routeSlug,
    toast,
    selectedTagIds,
    setSelectedTagIds,
    setCategoryId,
  })

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

  const setCoverImage = cover.setCoverImage
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
  }, [setCoverImage])

  const currentSnapshot = useMemo(
    () => snapshotFromFields({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      publishedAt,
      coverImage: cover.coverImage,
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, publishedAt, cover.coverImage, body],
  )

  useEffect(() => {
    if (isNew) return undefined

    let active = true
    const draft = location.state?.draft

    getNote(routeSlug)
      .then((note) => {
        if (!active) return

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

  const markSlugTaken = useCallback((trimmed) => {
    setSlugCheckResult({ key: trimmed, result: 'taken' })
  }, [])

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  const hasUserContent = useMemo(
    () => noteHasUserContent({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      coverImage: cover.coverImage,
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, cover.coverImage, body],
  )

  return {
    isNew,
    loading,
    view,
    setView,
    slug,
    title,
    summary,
    setSummary,
    categoryId,
    setCategoryId,
    selectedTagIds,
    publishedAt,
    published,
    setPublished,
    pinned,
    setPinned,
    body,
    setBody,
    fieldErrors,
    setFieldErrors,
    clearFieldError,
    baseline,
    setBaseline,
    currentSnapshot,
    isDirty,
    hasUserContent,
    slugStatus,
    handleTitleChange,
    handleSlugChange,
    refreshSlugFromTitle,
    markSlugTaken,
    cover,
    catalog,
  }
}
