import { MDXProvider } from '@mdx-js/react'
import { mdxComponents } from '@/mdx/mdxComponents'

function MdxBody({ component: Component }) {
  if (!Component) {
    return (
      <section className="mdx-empty-state" role="status" aria-live="polite">
        <p className="mdx-empty-label">Content unavailable</p>
        <p className="mdx-empty-title">This section has no published content yet.</p>
        <p className="mdx-empty-description">
          It may still be in draft or syncing. Please check back later.
        </p>
      </section>
    )
  }

  return (
    <MDXProvider components={mdxComponents}>
      <Component components={mdxComponents} />
    </MDXProvider>
  )
}

export default MdxBody
