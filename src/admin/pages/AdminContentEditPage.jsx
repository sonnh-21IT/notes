import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import PageLoading from '@/ui/PageLoading'
import AdminConfirmPanel from '@/admin/components/AdminConfirmPanel'
import AdminEditorToolbar from '@/admin/components/AdminEditorToolbar'
import AdminFieldError from '@/admin/components/AdminFieldError'
import AdminFlash from '@/admin/components/AdminFlash'
import AdminPageHeader from '@/admin/components/AdminPageHeader'
import AdminValidationSummary from '@/admin/components/AdminValidationSummary'
import useMdxPreview from '@/admin/hooks/useMdxPreview'
import { fieldClassName, validateContentBody } from '@/admin/lib/validation'
import { clearContentDraft, contentPreviewClassName } from '@/admin/lib/contentDraft'
import { adminGetContent, adminUpdateContentBody } from '@/data/supabase/admin.provider'
import MdxBody from '@/content/mdx/MdxBody'

function AdminContentEditPage() {
  const { slug } = useParams()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState(() => (location.state?.view === 'preview' ? 'preview' : 'edit'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [savedBody, setSavedBody] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)

  const { MdxContent, loading: mdxLoading, error: mdxError } = useMdxPreview(body, view === 'preview')

  useEffect(() => {
    let active = true
    const draft = location.state?.draft

    adminGetContent(slug)
      .then((page) => {
        if (!active) return
        if (!page) throw new Error('Page not found')
        setTitle(page.title ?? '')
        if (draft?.slug === slug) {
          const nextBody = draft.body ?? ''
          setBody(nextBody)
          setSavedBody(page.body ?? '')
        } else {
          const nextBody = page.body ?? ''
          setBody(nextBody)
          setSavedBody(nextBody)
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
  }, [slug, location.state])

  function runValidation() {
    const result = validateContentBody(body)
    setFieldErrors(result.errors)
    return result.valid
  }

  async function performSave() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await adminUpdateContentBody({ slug, body })
      clearContentDraft()
      setSavedBody(body)
      setConfirm(null)
      setMessage('Page saved.')
      setView('edit')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
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
      title: 'Save page?',
      description: `Changes to "${title || slug}" will go live on the public site.`,
      tone: 'warn',
      confirmLabel: 'Save page',
      onConfirm: performSave,
    })
  }

  function handleShowPreview() {
    setError('')
    setMessage('')
    setConfirm(null)

    if (!runValidation()) return

    setView('preview')
  }

  if (loading) return <PageLoading label="Loading page" />

  const isDirty = savedBody !== null && body !== savedBody

  return (
    <div className="admin-page admin-page--editor">
      <p className="admin-breadcrumb">
        <Link to="/admin/content">Content</Link>
        <span aria-hidden="true"> / </span>
        {slug}
        {view === 'preview' && (
          <>
            <span aria-hidden="true"> / </span>
            Preview
          </>
        )}
      </p>

      <AdminPageHeader
        title={title || slug}
        description={view === 'preview' ? 'Preview how this page will look on the site.' : 'Edit MDX body.'}
      />

      {view === 'preview' && (
        <div className="admin-preview-banner" role="status">
          Preview — not saved yet. This is how the page will look on the site.
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
          <section className="admin-section">
            <label className="admin-field">
              <span className="admin-label">Body (MDX)</span>
              <textarea
                className={fieldClassName('admin-textarea admin-textarea--code', fieldErrors.body)}
                rows={22}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value)
                  if (fieldErrors.body) setFieldErrors((current) => ({ ...current, body: '' }))
                }}
              />
              <AdminFieldError message={fieldErrors.body} />
            </label>
          </section>

          <AdminValidationSummary errors={fieldErrors} />
        </form>
      ) : (
        <div className="admin-preview-pane">
          {slug === 'notes' && (
            <p className="admin-field-hint admin-preview-hint">
              Only the notes intro is shown here. The notes list below it on the live site is unchanged.
            </p>
          )}

          {mdxLoading ? (
            <PageLoading label="Rendering preview" />
          ) : (
            <article className={contentPreviewClassName(slug)}>
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
        saveLabel="Save page"
        saving={saving}
        disabled={Boolean(confirm)}
        saveDisabled={!isDirty || (view === 'preview' && mdxLoading)}
      />
    </div>
  )
}

export default AdminContentEditPage
