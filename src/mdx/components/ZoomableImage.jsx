import '@/styles/public/mdx/lightbox.css'
import { Minus, Plus, X } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
import { createPortal } from 'react-dom'

const MIN_SCALE = 1
const MAX_SCALE = 4
const STEP = 0.25

function ZoomableImage({ src, alt = '', title, className }) {
  const [open, setOpen] = useState(false)
  const [scale, setScale] = useState(1)

  const onKey = useEffectEvent((event) => {
    if (event.key === 'Escape') setOpen(false)
    if (event.key === '+' || event.key === '=') setScale((s) => Math.min(MAX_SCALE, s + STEP))
    if (event.key === '-' || event.key === '_') setScale((s) => Math.max(MIN_SCALE, s - STEP))
    if (event.key === '0') setScale(1)
  })

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openLightbox = () => {
    setScale(1)
    setOpen(true)
  }

  const zoomBy = (delta) => {
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((s + delta).toFixed(2)))))
  }

  return (
    <>
      <img
        className={['mdx-zoomable-img', className].filter(Boolean).join(' ')}
        src={src}
        alt={alt}
        title={title || alt || 'Open image'}
        loading="lazy"
        role="button"
        tabIndex={0}
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openLightbox()
          }
        }}
      />
      {open
        ? createPortal(
            <div
              className="mdx-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={alt || 'Image preview'}
              onClick={() => setOpen(false)}
            >
              <div className="mdx-lightbox-toolbar" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="mdx-lightbox-btn" aria-label="Zoom out" onClick={() => zoomBy(-STEP)}>
                  <Minus size={18} strokeWidth={2.25} aria-hidden />
                </button>
                <button type="button" className="mdx-lightbox-btn" aria-label="Reset zoom" onClick={() => setScale(1)}>
                  {Math.round(scale * 100)}%
                </button>
                <button type="button" className="mdx-lightbox-btn" aria-label="Zoom in" onClick={() => zoomBy(STEP)}>
                  <Plus size={18} strokeWidth={2.25} aria-hidden />
                </button>
                <button type="button" className="mdx-lightbox-btn" aria-label="Close" onClick={() => setOpen(false)}>
                  <X size={18} strokeWidth={2.25} aria-hidden />
                </button>
              </div>
              <div
                className="mdx-lightbox-stage"
                onClick={(event) => event.stopPropagation()}
                onWheel={(event) => {
                  event.preventDefault()
                  zoomBy(event.deltaY < 0 ? STEP : -STEP)
                }}
              >
                <img
                  className="mdx-lightbox-image"
                  src={src}
                  alt={alt}
                  style={{ transform: `scale(${scale})` }}
                  draggable={false}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default ZoomableImage
