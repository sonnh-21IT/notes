import { lazy, Suspense } from 'react'
import Callout from '@/mdx/components/Callout'
import { getLanguage, getRawCode } from '@/mdx/components/codeBlockUtils'
import MdxLink from '@/mdx/components/MdxLink'
import { Tab, Tabs } from '@/mdx/components/Tabs'
import Tweet from '@/mdx/components/Tweet'
import YouTube from '@/mdx/components/YouTube'
import { isSafeAssetUrl } from '@/utils/safeUrl'

const CodeBlock = lazy(() => import('@/mdx/components/CodeBlock'))

function PlainCodeBlock({ children, className = '', ...props }) {
  const language = getLanguage(children, className)
  const rawCode = getRawCode(children)

  return (
    <div className="code-block-shell">
      <pre className={['code-block', className].filter(Boolean).join(' ')} {...props}>
        <code className={language ? `language-${language}` : undefined}>{rawCode}</code>
      </pre>
    </div>
  )
}

function MdxImage({ alt = '', src, title }) {
  if (!isSafeAssetUrl(src)) return null

  return <img className="prose-img" alt={alt} src={src} title={title} loading="lazy" />
}

// ponytail: only override what differs from plain HTML — styling lives in .prose CSS
export const mdxComponents = {
  wrapper: ({ children }) => <div className="prose">{children}</div>,
  a: MdxLink,
  pre: (props) => (
    <Suspense fallback={<PlainCodeBlock {...props} />}>
      <CodeBlock {...props} />
    </Suspense>
  ),
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
  img: MdxImage,
  Callout,
  Tabs,
  Tab,
  YouTube,
  Tweet,
}
