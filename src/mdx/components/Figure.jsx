import '@/styles/public/mdx/media.css'
import ZoomableImage from '@/mdx/components/ZoomableImage'
import { isSafeAssetUrl } from '@/utils/safeUrl'

function Figure({ src, alt = '', caption, title, children }) {
  if (!isSafeAssetUrl(src)) return null

  const captionText = caption ?? children

  return (
    <figure className="mdx-figure">
      <ZoomableImage className="mdx-figure-img" src={src} alt={alt} title={title} />
      {captionText ? <figcaption className="mdx-figure-caption">{captionText}</figcaption> : null}
    </figure>
  )
}

export default Figure
