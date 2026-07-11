import '@/styles/public/mdx/badge.css'
import { Children } from 'react'

function Badge({ children, color }) {
  const tone = color ? ` mdx-badge--${color}` : ''
  return <span className={`mdx-badge${tone}`}>{children}</span>
}

function Badges({ children }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-badges">{items}</div>
}

export { Badges }
export default Badge
