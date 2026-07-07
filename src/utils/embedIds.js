const YOUTUBE_ID = /^[\w-]{11}$/
const TWEET_ID = /^\d{5,}$/

export function parseYouTubeId(value) {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (YOUTUBE_ID.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0]
      return YOUTUBE_ID.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const fromQuery = url.searchParams.get('v')
      if (fromQuery && YOUTUBE_ID.test(fromQuery)) return fromQuery

      const fromPath = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)
      if (fromPath) return fromPath[1]
    }
  } catch {
    return null
  }

  return null
}

export function parseTweetId(value) {
  if (!value || typeof value !== 'string') return null

  const trimmed = value.trim()
  if (TWEET_ID.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    const host = url.hostname.replace(/^(www\.|mobile\.)?/, '')

    if (host === 'twitter.com' || host === 'x.com') {
      const match = url.pathname.match(/\/status\/(\d+)/)
      if (match) return match[1]
    }
  } catch {
    return null
  }

  return null
}

export function youTubeWatchUrl(id) {
  return id ? `https://www.youtube.com/watch?v=${id}` : null
}

export function tweetPermalink(id) {
  return id ? `https://x.com/i/web/status/${id}` : null
}
