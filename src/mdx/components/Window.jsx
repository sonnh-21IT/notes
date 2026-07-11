import '@/styles/public/mdx/window.css'

function Window({ title = 'Window', children }) {
  return (
    <div className="mdx-window">
      <div className="mdx-window-chrome">
        <span className="mdx-window-dots" aria-hidden>
          <span className="mdx-window-dot mdx-window-dot--close" />
          <span className="mdx-window-dot mdx-window-dot--minimize" />
          <span className="mdx-window-dot mdx-window-dot--zoom" />
        </span>
        <span className="mdx-window-title">{title}</span>
      </div>
      <div className="mdx-window-body">{children}</div>
    </div>
  )
}

export default Window
