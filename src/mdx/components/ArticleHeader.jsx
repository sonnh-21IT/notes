import { Folder, Tag } from 'lucide-react'
import { formatArticleDate } from '@/utils/formatArticleMeta'
import { isSafeAssetUrl } from '@/utils/safeUrl'

function ArticleHeader({ title, publishedAt, category, coverImage, tags = [] }) {
  const dateLabel = formatArticleDate(publishedAt)
  const noteTags = tags.filter(Boolean)
  const hasLabels = Boolean(category) || noteTags.length > 0
  const hasMeta = dateLabel || hasLabels

  return (
    <header className="article-header">
      <h1 className="content-title">{title}</h1>

      {hasMeta && (
        <p className="article-meta">
          {dateLabel && <time dateTime={publishedAt}>{dateLabel}</time>}
          {hasLabels && (
            <span className="article-meta-tags">
              {category && (
                <span className="article-meta-tag">
                  <Folder className="article-meta-tag-icon" aria-hidden="true" size={12} strokeWidth={2} />
                  {category}
                </span>
              )}
              {noteTags.map((tag) => (
                <span key={tag} className="article-meta-tag">
                  <Tag className="article-meta-tag-icon" aria-hidden="true" size={12} strokeWidth={2} />
                  {tag}
                </span>
              ))}
            </span>
          )}
        </p>
      )}

      {isSafeAssetUrl(coverImage) && (
        <figure className="article-cover">
          <img src={coverImage} alt="" loading="lazy" />
        </figure>
      )}
    </header>
  )
}

export default ArticleHeader
