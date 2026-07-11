import '@/styles/public/mdx/option.css'

function Option({ flag, type, children }) {
  return (
    <div className="mdx-option">
      <div className="mdx-option-meta">
        <code className="mdx-option-flag">{flag}</code>
        {type ? <span className="mdx-option-type">{type}</span> : null}
      </div>
      {children ? <div className="mdx-option-body">{children}</div> : null}
    </div>
  )
}

export default Option
