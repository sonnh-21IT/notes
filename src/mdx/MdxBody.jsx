import '@/styles/public/mdx/empty-state.css'
import { MDXProvider } from '@mdx-js/react'
import { mdxComponents } from '@/mdx/mdxComponents'

const emptyCopy = {
  default: {
    label: 'Coming soon',
    title: 'Nothing here yet',
    description: 'This page is still empty. Check back soon.',
  },
  about: {
    label: 'About',
    title: 'Introduction coming soon',
    description: 'A short intro will live here. Meanwhile, browse notes when they appear below.',
  },
  notes: {
    label: 'Notes',
    title: 'Notes will show up here',
    description: 'Published writing appears in the list below. Search and filters help once there are a few.',
  },
  'not-found': {
    label: 'Missing page',
    title: 'This page isn\'t available',
    description: 'Try Notes or About from the menu.',
  },
}

function MdxBody({ component: Component, empty = 'default' }) {
  if (!Component) {
    const copy = emptyCopy[empty] ?? emptyCopy.default
    return (
      <section className="mdx-empty-state" role="status" aria-live="polite">
        <p className="content-label">{copy.label}</p>
        <h1 className="content-title">{copy.title}</h1>
        <p className="content-lead">{copy.description}</p>
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
