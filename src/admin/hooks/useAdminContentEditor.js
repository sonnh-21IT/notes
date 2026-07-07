import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { contentPageSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { clearContentDraft } from '@/admin/lib/contentDraft'
import { validateContentBody } from '@/admin/lib/validation'
import { getContent, updateContentBody } from '@/data/admin'

export function useAdminContentEditor() {
  const { slug } = useParams()
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(() => (location.state?.view === 'preview' ? 'preview' : 'edit'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
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
    const draft = location.state?.draft

    getContent(slug)
      .then((page) => {
        if (!active) return
        if (!page) throw new Error('Page not found')

        setTitle(page.title ?? '')
        const nextBody = draft?.slug === slug ? (draft.body ?? '') : (page.body ?? '')
        setBody(nextBody)
        setBaseline(contentPageSnapshot({ body: page.body ?? '' }))

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
  }, [slug, location.state])

  const runValidation = useCallback(() => {
    const result = validateContentBody(body)
    setFieldErrors(result.errors)
    return result.valid
  }, [body])

  const performSave = useCallback(async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateContentBody({ slug, body })
      clearContentDraft()
      setBaseline(currentSnapshot)
      setConfirm(null)
      setMessage('Page saved.')
      setView('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }, [slug, body, currentSnapshot])

  const requestSave = useCallback(() => {
    setError('')
    setMessage('')

    if (view === 'preview' && mdxError) {
      setError('Fix MDX errors before saving.')
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
  }, [view, mdxError, runValidation, title, slug, performSave])

  const handleShowPreview = useCallback(() => {
    setError('')
    setMessage('')
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
    saving,
    error,
    message,
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
