import { parseYouTubeId, youTubeWatchUrl } from '@/utils/embedIds'

function YouTube({ id, url, title = 'YouTube video' }) {
  const videoId = parseYouTubeId(id ?? url)
  if (!videoId) return null

  const watchUrl = youTubeWatchUrl(videoId)

  return (
    <figure className="mdx-embed mdx-embed-youtube">
      <div className="mdx-embed-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="mdx-embed-caption">
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </figcaption>
    </figure>
  )
}

export default YouTube
