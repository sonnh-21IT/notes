import '@/styles/public/mdx/repo.css'
import { Link } from 'react-router-dom'
import { isSafeAssetUrl } from '@/utils/safeUrl'

function Repo({ href, title, description, children }) {
  if (!isSafeAssetUrl(href)) return null

  const heading = title || href
  const desc = description || children
  const body = (
    <>
      <span className="mdx-repo-title">{heading}</span>
      {desc ? <span className="mdx-repo-desc">{desc}</span> : null}
    </>
  )

  if (href.startsWith('/')) {
    return (
      <Link className="mdx-repo" to={href}>
        {body}
      </Link>
    )
  }

  return (
    <a className="mdx-repo" href={href} target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  )
}

export default Repo
