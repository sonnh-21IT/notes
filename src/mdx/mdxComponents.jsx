import { lazy, Suspense } from 'react'
import { Accordion, Accordions } from '@/mdx/components/Accordion'
import Badge, { Badges } from '@/mdx/components/Badge'
import Banner from '@/mdx/components/Banner'
import Button from '@/mdx/components/Button'
import Callout from '@/mdx/components/Callout'
import { Card, Cards } from '@/mdx/components/Cards'
import { getLanguage, getRawCode } from '@/mdx/components/codeBlockUtils'
import { Column, Columns } from '@/mdx/components/Columns'
import { Compare, CompareItem } from '@/mdx/components/Compare'
import Endpoint, { Params, RequestBody, Response, Responses } from '@/mdx/components/Endpoint'
import { Field, Fields } from '@/mdx/components/Fields'
import { File, Files, Folder } from '@/mdx/components/Files'
import Figure from '@/mdx/components/Figure'
import Frame from '@/mdx/components/Frame'
import Kbd from '@/mdx/components/Kbd'
import MdxLink from '@/mdx/components/MdxLink'
import Option from '@/mdx/components/Option'
import Output from '@/mdx/components/Output'
import Repo from '@/mdx/components/Repo'
import { Step, Steps } from '@/mdx/components/Steps'
import { Tab, Tabs } from '@/mdx/components/Tabs'
import Terminal from '@/mdx/components/Terminal'
import { Timeline, TimelineItem } from '@/mdx/components/Timeline'
import Tweet from '@/mdx/components/Tweet'
import Video from '@/mdx/components/Video'
import Window from '@/mdx/components/Window'
import YouTube from '@/mdx/components/YouTube'
import ZoomableImage from '@/mdx/components/ZoomableImage'
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

  return <ZoomableImage className="prose-img" alt={alt} src={src} title={title} />
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
  Accordion,
  Accordions,
  Badge,
  Badges,
  Banner,
  Button,
  Callout,
  Card,
  Cards,
  Column,
  Columns,
  Compare,
  CompareItem,
  Endpoint,
  Field,
  Fields,
  Params,
  RequestBody,
  Response,
  Responses,
  File,
  Files,
  Folder,
  Figure,
  Frame,
  Kbd,
  Option,
  Output,
  Repo,
  Step,
  Steps,
  Tab,
  Tabs,
  Terminal,
  Timeline,
  TimelineItem,
  Tweet,
  Video,
  Window,
  YouTube,
}
