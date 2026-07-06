import { Link } from 'react-router-dom'
import Callout from '@/content/components/Callout'
import CodeBlock from '@/content/components/CodeBlock'
import { Tab, Tabs } from '@/content/components/Tabs'

function MdxLink({ href = '', children, ...props }) {
  if (href.startsWith('/')) {
    return (
      <Link className="content-link" to={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a className="content-link" href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

// ponytail: only override what differs from plain HTML — styling lives in .prose CSS
export const mdxComponents = {
  wrapper: ({ children }) => <div className="prose">{children}</div>,
  a: MdxLink,
  pre: (props) => <CodeBlock {...props} />,
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes('language-') || className?.includes('shiki')

    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }

    return (
      <code className="inline-code" {...props}>
        {children}
      </code>
    )
  },
  img: ({ alt = '', ...props }) => (
    <img className="prose-img" alt={alt} loading="lazy" {...props} />
  ),
  Callout,
  Tabs,
  Tab,
}
