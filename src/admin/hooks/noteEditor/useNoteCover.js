import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteCoverImage, uploadCoverImage } from '@/data/admin'

export function useNoteCover({ initialCoverImage = '', clearFieldError, setFieldErrors }) {
  const [coverImage, setCoverImage] = useState(initialCoverImage)
  const [coverUploading, setCoverUploading] = useState(false)
  const sessionCoverUploadsRef = useRef(new Set())
  const coverImageRef = useRef('')
  coverImageRef.current = coverImage

  useEffect(() => {
    const sessionUploads = sessionCoverUploadsRef.current
    return () => {
      for (const url of sessionUploads) {
        deleteCoverImage(url).catch(() => {})
      }
      sessionUploads.clear()
    }
  }, [])

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
  }, [clearFieldError, setFieldErrors])

  const handleCoverRemove = useCallback(() => {
    const previous = coverImageRef.current
    setCoverImage('')
    clearFieldError('coverImage')

    if (previous && sessionCoverUploadsRef.current.has(previous)) {
      sessionCoverUploadsRef.current.delete(previous)
      deleteCoverImage(previous).catch(() => {})
    }
  }, [clearFieldError])

  const forgetSessionCover = useCallback((url) => {
    if (url) sessionCoverUploadsRef.current.delete(url)
  }, [])

  const clearSessionCovers = useCallback(() => {
    sessionCoverUploadsRef.current.clear()
  }, [])

  const hasSessionCover = useCallback((url) => sessionCoverUploadsRef.current.has(url), [])

  return {
    coverImage,
    setCoverImage,
    coverUploading,
    handleCoverSelect,
    handleCoverRemove,
    forgetSessionCover,
    clearSessionCovers,
    hasSessionCover,
  }
}
