import '@/styles/public/mdx/compare.css'
import { Children } from 'react'

function CompareItem({ label = 'Side', children }) {
  return (
    <div className="mdx-compare-item">
      <div className="mdx-compare-label">{label}</div>
      <div className="mdx-compare-body">{children}</div>
    </div>
  )
}

function Compare({ children }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-compare">{items}</div>
}

export { Compare, CompareItem }
