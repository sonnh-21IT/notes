import '@/styles/public/mdx/fields.css'
import { Children } from 'react'

function Field({ name, type, required = false, children }) {
  return (
    <div className="mdx-field">
      <div className="mdx-field-meta">
        <code className="mdx-field-name">{name}</code>
        {type ? <span className="mdx-field-type">{type}</span> : null}
        {required ? <span className="mdx-field-required">required</span> : null}
      </div>
      {children ? <div className="mdx-field-body">{children}</div> : null}
    </div>
  )
}

function Fields({ children }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-fields">{items}</div>
}

export { Field, Fields }
