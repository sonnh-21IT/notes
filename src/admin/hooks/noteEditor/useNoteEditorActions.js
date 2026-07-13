import { useCallback, useRef, useState } from 'react'
import { buildNotePayload } from '@/admin/lib/noteEditorModel'
import { noteFlagsToastMessage } from '@/admin/lib/noteFlags'
import { clearNoteDraft } from '@/admin/lib/noteDraft'
import { isValidNoteSlug, validateNoteFields } from '@/admin/lib/validation'
import {
  deleteCoverImage,
  deleteNote,
  getNote,
  updateNoteFlags,
  upsertNote,
} from '@/data/admin'
import { invalidateNoteContent } from '@/data/content'

/** Save / delete / preview / flag actions for the note editor. */
export function useNoteEditorActions({
  form,
  navigate,
  toast,
  mdxError,
}) {
  const saveInFlightRef = useRef(false)
  const togglingFlagsRef = useRef(false)
  const [confirm, setConfirm] = useState(null)

  const {
    isNew,
    view,
    setView,
    slug,
    title,
    summary,
    categoryId,
    selectedTagIds,
    publishedAt,
    published,
    setPublished,
    pinned,
    setPinned,
    body,
    setFieldErrors,
    baseline,
    setBaseline,
    currentSnapshot,
    markSlugTaken,
    cover,
  } = form

  const notePayload = useCallback(
    () => buildNotePayload({
      slug,
      title,
      summary,
      categoryId,
      selectedTagIds,
      publishedAt,
      coverImage: cover.coverImage,
      published,
      pinned,
      body,
    }),
    [slug, title, summary, categoryId, selectedTagIds, publishedAt, cover.coverImage, published, pinned, body],
  )

  const runValidation = useCallback(() => {
    const result = validateNoteFields({
      slug,
      title,
      summary,
      body,
      coverImage: cover.coverImage,
      publishedAt,
    })
    setFieldErrors(result.errors)
    return result.valid
  }, [slug, title, summary, body, cover.coverImage, publishedAt, setFieldErrors])

  const validateSlugAvailable = useCallback(async () => {
    if (!isNew) return true

    const trimmed = slug.trim()
    if (!isValidNoteSlug(trimmed)) return true

    try {
      const existing = await getNote(trimmed)
      if (existing) {
        markSlugTaken(trimmed)
        return false
      }
      return true
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
      return false
    }
  }, [isNew, slug, toast, markSlugTaken])

  const forgetSessionCover = cover.forgetSessionCover
  const clearSessionCovers = cover.clearSessionCovers

  const performSave = useCallback(async () => {
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      if (!(await validateSlugAvailable())) return

      const previousCover = baseline?.coverImage ?? null
      const payload = notePayload()
      await upsertNote(payload)

      invalidateNoteContent(payload.slug)
      if (!isNew && slug.trim() && slug.trim() !== payload.slug) {
        invalidateNoteContent(slug.trim())
      }

      if (previousCover && previousCover !== payload.coverImage) {
        await deleteCoverImage(previousCover).catch(() => {})
      }

      forgetSessionCover(payload.coverImage)
      clearSessionCovers()

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
  }, [
    notePayload,
    currentSnapshot,
    baseline,
    isNew,
    slug,
    navigate,
    toast,
    validateSlugAvailable,
    forgetSessionCover,
    clearSessionCovers,
    setBaseline,
    setView,
  ])

  const performDelete = useCallback(async () => {
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      await deleteNote(slug)
      invalidateNoteContent(slug)
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
  }, [runValidation, validateSlugAvailable, setView])

  const requestSave = useCallback(async () => {
    setConfirm(null)

    if (view === 'preview' && mdxError) {
      toast.showError('Fix the formatting errors in the preview before saving.')
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
      description: 'This permanently deletes the note. This cannot be undone.',
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
      invalidateNoteContent(slug.trim())
      toast.showSuccess(noteFlagsToastMessage(patch))
    } catch (err) {
      setPublished(previous.published)
      setPinned(previous.pinned)
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      togglingFlagsRef.current = false
    }
  }, [isNew, slug, published, pinned, toast, setPublished, setPinned])

  const togglePublished = useCallback(() => {
    if (isNew) {
      setPublished((value) => !value)
      return
    }
    patchNoteFlags({ published: !published })
  }, [isNew, patchNoteFlags, published, setPublished])

  const togglePinned = useCallback(() => {
    if (isNew) {
      setPinned((value) => !value)
      return
    }
    patchNoteFlags({ pinned: !pinned })
  }, [isNew, patchNoteFlags, pinned, setPinned])

  return {
    confirm,
    setConfirm,
    requestSave,
    handleShowPreview,
    handleDelete,
    togglePublished,
    togglePinned,
  }
}
