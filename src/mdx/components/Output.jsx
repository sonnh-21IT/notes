import '@/styles/public/mdx/output.css'

function Output({ title = 'Output', children }) {
  return (
    <div className="mdx-output">
      {title ? <div className="mdx-output-title">{title}</div> : null}
      <div className="mdx-output-body">{children}</div>
    </div>
  )
}

export default Output
