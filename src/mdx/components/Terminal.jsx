import '@/styles/public/mdx/terminal.css'

function Terminal({ title = 'Terminal', children }) {
  return (
    <div className="mdx-terminal">
      {title ? <div className="mdx-terminal-title">{title}</div> : null}
      <div className="mdx-terminal-body">{children}</div>
    </div>
  )
}

export default Terminal
