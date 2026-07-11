import '@/styles/public/mdx/columns.css'
import { Children } from 'react'

function Columns({ children }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-columns">{items}</div>
}

function Column({ children }) {
  return <div className="mdx-column">{children}</div>
}

export { Column, Columns }
