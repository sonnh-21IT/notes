import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAdminToast } from '@/admin/hooks/useAdminToast'
import { settingsSnapshot, snapshotEquals } from '@/admin/lib/formDirty'
import { validateSettings } from '@/admin/lib/validation'
import { getSettings, updateSettings } from '@/data/admin'
import { invalidateSiteContent } from '@/data/content'

function emptyLink() {
  return { id: '', label: '', url: '' }
}

export function useAdminSettings() {
  const toast = useAdminToast()
  const saveInFlightRef = useRef(false)

  const [loading, setLoading] = useState(true)
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
      .catch((err) => toast.showError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [toast])

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
    if (saveInFlightRef.current) return
    saveInFlightRef.current = true
    setConfirm(null)

    try {
      await updateSettings({
        header: { title: headerTitle, tagline: headerTagline },
        footer: {
          socialLinks: socialLinks.filter((link) => link.label && link.url),
        },
      })
      invalidateSiteContent()
      setBaseline(settingsSnapshot({ headerTitle, headerTagline, socialLinks }))
      toast.showSuccess('Settings saved.')
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : String(err))
    } finally {
      saveInFlightRef.current = false
    }
  }, [headerTitle, headerTagline, socialLinks, toast])

  const requestRemoveLink = useCallback((index) => {
    setConfirm({
      title: 'Remove social link?',
      description: 'This removes the link. Save changes to update the public site.',
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
