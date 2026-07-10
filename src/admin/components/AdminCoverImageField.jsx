import { ImagePlus, RefreshCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function AdminCoverImageField({
  value,
  uploading = false,
  onSelectFile,
  onRemove,
}) {
  const inputRef = useRef(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const hasImage = Boolean(value?.trim())

  useEffect(() => {
    if (!lightboxOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen])

  return (
    <div className="admin-cover-field">
      {hasImage ? (
        <div className={`admin-cover-thumb-wrap${uploading ? ' is-uploading' : ''}`}>
          <button
            type="button"
            className="admin-cover-thumb-hit"
            aria-label="View cover image full size"
            disabled={uploading}
            onClick={() => setLightboxOpen(true)}
          >
            <img src={value} alt="" className="admin-cover-thumb" />
          </button>

          <button
            type="button"
            className="admin-cover-thumb-remove"
            aria-label="Remove cover image"
            disabled={uploading}
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <X size={14} strokeWidth={2.5} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="admin-cover-thumb-replace"
            aria-label="Replace cover image"
            disabled={uploading}
            onClick={(event) => {
              event.stopPropagation()
              inputRef.current?.click()
            }}
          >
            <RefreshCw size={16} strokeWidth={2.25} aria-hidden="true" />
            <span>Replace</span>
          </button>

          {uploading ? (
            <p className="admin-cover-thumb-status" role="status">Uploading…</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="admin-cover-upload"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={18} strokeWidth={2.25} aria-hidden="true" />
          <span>{uploading ? 'Uploading…' : 'Upload cover image'}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="admin-cover-file-input"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) onSelectFile(file)
        }}
      />

      {lightboxOpen && hasImage ? (
        <div
          className="admin-cover-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Cover image preview"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="admin-cover-lightbox-close"
            aria-label="Close preview"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <img
            src={value}
            alt=""
            className="admin-cover-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  )
}

export default AdminCoverImageField
