import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { contentPageSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { clearContentDraft } from '@/admin/lib/contentDraft'
import { validateContentBody } from '@/admin/lib/validation'
import { getContent, updateContentBody } from '@/data/admin'
import { invalidatePageContent } from '@/data/content'

export function useAdminContentEditor() {
  const { slug } = useParams()
  const location = useLocation()
  const toast = useAdminToast()
  const saveInFlightRef = useRef(false)
  const draft = location.state?.draft
  const initialView = location.state?.view

  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(() => (initialView === 'preview' ? 'preview' : 'edit'))
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(null)

  const isPreview = view === 'preview'
  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(body, isPreview)

  const currentSnapshot = useMemo(() => contentPageSnapshot({ body }), [body])
  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  useEffect(() => {
    let active = true

    getContent(slug)
      .then((page) => {
        if (!active) return
        if (!page) throw new Error('Page not found')

        setTitle(page.title ?? '')
        const nextBody = draft?.slug === slug ? (draft.body ?? '') : (page.body ?? '')
        setBody(nextBody)
        setBaseline(contentPageSnapshot({ body: page.body ?? '' }))

        if (initialView === 'preview') {
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
  }, [slug, draft, initialView, toast])

  const runValidation = useCallback(() => {
    const result = validateContentBody(body)
    setFieldErrors(result.errors)
    return result.valid
  }, [body])

  const performSave = useCallback(async () => {
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      await updateContentBody({ slug, body })
      clearContentDraft()
      invalidatePageContent(slug)
      setBaseline(currentSnapshot)
      toast.showSuccess('Page saved.')
      setView('edit')
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      saveInFlightRef.current = false
    }
  }, [slug, body, currentSnapshot, toast])

  const requestSave = useCallback(() => {
    if (view === 'preview' && mdxError) {
      toast.showError('Fix the formatting errors in the preview before saving.')
      return
    }

    if (!runValidation()) return

    setConfirm({
      title: 'Save page?',
      description: `Changes to "${title || slug}" will go live on the public site.`,
      tone: 'warn',
      confirmLabel: 'Save page',
      onConfirm: performSave,
    })
  }, [view, mdxError, runValidation, title, slug, performSave, toast])

  const handleShowPreview = useCallback(() => {
    setConfirm(null)

    if (!runValidation()) return

    setView('preview')
  }, [runValidation])

  const clearFieldError = useCallback((field) => {
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }, [])

  return {
    slug,
    title,
    loading,
    view,
    isPreview,
    isDirty,
    confirm,
    setConfirm,
    setView,
    body,
    setBody,
    fieldErrors,
    clearFieldError,
    mdxPreview: { MdxContent, loading: mdxLoading, error: mdxError },
    requestSave,
    handleShowPreview,
  }
}
