import { useCallback, useEffect, useMemo, useState } from 'react'
import { settingsSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { validateSettings } from '@/admin/lib/validation'
import { getSettings, updateSettings } from '@/data/admin'
import { invalidateSiteContent } from '@/data/content'

function emptyLink() {
  return { id: '', label: '', url: '' }
}

export function useAdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [headerTitle, setHeaderTitle] = useState('')
  const [headerTagline, setHeaderTagline] = useState('')
  const [socialLinks, setSocialLinks] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const [baseline, setBaseline] = useState(null)

  useEffect(() => {
    getSettings()
      .then(({ header, footer }) => {
        const nextTitle = header.title ?? ''
        const nextTagline = header.tagline ?? ''
        const nextLinks = footer.socialLinks?.length ? footer.socialLinks : [emptyLink()]
        setHeaderTitle(nextTitle)
        setHeaderTagline(nextTagline)
        setSocialLinks(nextLinks)
        setBaseline(settingsSnapshot({
          headerTitle: nextTitle,
          headerTagline: nextTagline,
          socialLinks: nextLinks,
        }))
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  const updateLink = useCallback((index, field, value) => {
    setSocialLinks((links) => links.map((link, i) => (i === index ? { ...link, [field]: value } : link)))
    const key = `socialLinks.${index}.${field}`
    setFieldErrors((current) => (current[key] ? { ...current, [key]: '' } : current))
  }, [])

  const runValidation = useCallback(() => {
    const result = validateSettings({ headerTitle, socialLinks })
    setFieldErrors(result.errors)
    return result.valid
  }, [headerTitle, socialLinks])

  const performSave = useCallback(async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateSettings({
        header: { title: headerTitle, tagline: headerTagline },
        footer: {
          socialLinks: socialLinks.filter((link) => link.label && link.url),
        },
      })
      invalidateSiteContent()
      setBaseline(settingsSnapshot({ headerTitle, headerTagline, socialLinks }))
      setConfirm(null)
      setMessage('Settings saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }, [headerTitle, headerTagline, socialLinks])

  const requestRemoveLink = useCallback((index) => {
    setError('')
    setMessage('')
    setConfirm({
      title: 'Remove social link?',
      description: 'This removes the row from settings. Save changes to apply it publicly.',
      tone: 'warn',
      confirmLabel: 'Remove',
      onConfirm: () => {
        setSocialLinks((links) => links.filter((_, i) => i !== index))
        setConfirm(null)
      },
    })
  }, [])

  const handleSave = useCallback((event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!runValidation()) return

    setConfirm({
      title: 'Save settings?',
      description: 'Header and footer changes will appear on every public page.',
      tone: 'warn',
      confirmLabel: 'Save changes',
      onConfirm: performSave,
    })
  }, [runValidation, performSave])

  const currentSnapshot = useMemo(
    () => settingsSnapshot({ headerTitle, headerTagline, socialLinks }),
    [headerTitle, headerTagline, socialLinks],
  )

  const isDirty = baseline !== null && !snapshotEquals(currentSnapshot, baseline)

  const clearFieldError = useCallback((field) => {
    setFieldErrors((current) => (current[field] ? { ...current, [field]: '' } : current))
  }, [])

  return {
    loading,
    saving,
    error,
    message,
    confirm,
    setConfirm,
    headerTitle,
    setHeaderTitle,
    headerTagline,
    setHeaderTagline,
    socialLinks,
    setSocialLinks,
    fieldErrors,
    clearFieldError,
    updateLink,
    requestRemoveLink,
    handleSave,
    isDirty,
  }
}
