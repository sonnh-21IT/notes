import { MDXProvider } from '@mdx-js/react'
import { mdxComponents } from '@/content/mdx/mdxComponents'

function MdxBody({ component: Component }) {
  if (!Component) {
    return <p className="empty-content">No content available.</p>
  }

  return (
    <MDXProvider components={mdxComponents}>
      <Component components={mdxComponents} />
    </MDXProvider>
  )
}

export default MdxBody
