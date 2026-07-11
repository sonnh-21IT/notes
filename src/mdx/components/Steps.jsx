import '@/styles/public/mdx/steps.css'

function Step({ children, title }) {
  return (
    <div className="mdx-step">
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  )
}

function Steps({ children }) {
  return <div className="mdx-steps">{children}</div>
}

export { Step, Steps }
