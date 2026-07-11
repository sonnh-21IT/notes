import '@/styles/public/mdx/accordion.css'

function Accordion({ title, children, defaultOpen = false }) {
  return (
    <details className="mdx-accordion" defaultOpen={defaultOpen}>
      <summary className="mdx-accordion-summary">{title}</summary>
      <div className="mdx-accordion-body">{children}</div>
    </details>
  )
}

function Accordions({ children }) {
  return <div className="mdx-accordions">{children}</div>
}

export { Accordion, Accordions }
