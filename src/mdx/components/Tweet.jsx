import '@/styles/public/mdx/embed.css'
import { parseTweetId, tweetPermalink } from '@/utils/embedIds'

function Tweet({ id, url, title = 'Embedded post on X' }) {
  const tweetId = parseTweetId(id ?? url)
  if (!tweetId) return null

  const permalink = tweetPermalink(tweetId)

  return (
    <figure className="mdx-embed mdx-embed-tweet">
      <div className="mdx-embed-frame">
        <iframe
          src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&dnt=true`}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption className="mdx-embed-caption">
        <a href={permalink} target="_blank" rel="noopener noreferrer">
          View on X
        </a>
      </figcaption>
    </figure>
  )
}

export default Tweet
