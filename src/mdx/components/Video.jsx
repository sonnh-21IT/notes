import '@/styles/public/mdx/media.css'
import { isSafeAssetUrl } from '@/utils/safeUrl'

function Video({ src, title, poster, caption, controls = true }) {
  if (!isSafeAssetUrl(src)) return null

  return (
    <figure className="mdx-video">
      <video
        className="mdx-video-el"
        src={src}
        poster={isSafeAssetUrl(poster) ? poster : undefined}
        controls={controls}
        playsInline
        preload="metadata"
        title={title}
      />
      {caption || title ? (
        <figcaption className="mdx-video-caption">{caption || title}</figcaption>
      ) : null}
    </figure>
  )
}

export default Video
