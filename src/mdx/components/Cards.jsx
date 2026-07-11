import '@/styles/public/mdx/cards.css'
import { isSafeAssetUrl } from '@/utils/safeUrl'
import { Children } from 'react'
import { Link } from 'react-router-dom'

function CardTitle({ title, href }) {
  if (!title) return null

  if (href && isSafeAssetUrl(href)) {
    const className = 'mdx-card-title mdx-card-title--link'
    if (href.startsWith('/')) {
      return (
        <h3 className="mdx-card-title">
          <Link className={className} to={href}>
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <h3 className="mdx-card-title">
        <a className={className} href={href} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>
    )
  }

  return <h3 className="mdx-card-title">{title}</h3>
}

function Card({ title, description, href, children }) {
  return (
    <div className="mdx-card">
      <CardTitle title={title} href={href} />
      {description ? <p className="mdx-card-description">{description}</p> : null}
      {children ? <div className="mdx-card-body">{children}</div> : null}
    </div>
  )
}

function Cards({ children }) {
  // MDX leaves whitespace text nodes between tags — they become empty grid cells
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-cards">{items}</div>
}

export { Card, Cards }
