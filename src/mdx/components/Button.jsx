import '@/styles/public/mdx/button.css'
import { Link } from 'react-router-dom'

function Button({ href, children, variant = 'primary' }) {
  if (!href) return null

  const className = `mdx-button mdx-button--${variant}`

  if (href.startsWith('/')) {
    return (
      <Link className={className} to={href}>
        {children}
      </Link>
    )
  }

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export default Button
