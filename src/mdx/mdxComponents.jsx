import { lazy, Suspense } from 'react'
import Badge, { Badges } from '@/mdx/components/Badge'
import Button from '@/mdx/components/Button'
import { getLanguage, getRawCode } from '@/mdx/components/codeBlockUtils'
import Kbd from '@/mdx/components/Kbd'
import MdxLink from '@/mdx/components/MdxLink'
import ZoomableImage from '@/mdx/components/ZoomableImage'
import { isSafeAssetUrl } from '@/utils/safeUrl'

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((mod) => ({ default: mod[exportName] })))
}

const CodeBlock = lazy(() => import('@/mdx/components/CodeBlock'))
const Callout = lazy(() => import('@/mdx/components/Callout'))
const Banner = lazy(() => import('@/mdx/components/Banner'))
const Accordion = lazyNamed(() => import('@/mdx/components/Accordion'), 'Accordion')
const Accordions = lazyNamed(() => import('@/mdx/components/Accordion'), 'Accordions')
const Card = lazyNamed(() => import('@/mdx/components/Cards'), 'Card')
const Cards = lazyNamed(() => import('@/mdx/components/Cards'), 'Cards')
const Column = lazyNamed(() => import('@/mdx/components/Columns'), 'Column')
const Columns = lazyNamed(() => import('@/mdx/components/Columns'), 'Columns')
const Compare = lazyNamed(() => import('@/mdx/components/Compare'), 'Compare')
const CompareItem = lazyNamed(() => import('@/mdx/components/Compare'), 'CompareItem')
const Endpoint = lazy(() => import('@/mdx/components/Endpoint'))
const Params = lazyNamed(() => import('@/mdx/components/Endpoint'), 'Params')
const RequestBody = lazyNamed(() => import('@/mdx/components/Endpoint'), 'RequestBody')
const Response = lazyNamed(() => import('@/mdx/components/Endpoint'), 'Response')
const Responses = lazyNamed(() => import('@/mdx/components/Endpoint'), 'Responses')
const Field = lazyNamed(() => import('@/mdx/components/Fields'), 'Field')
const Fields = lazyNamed(() => import('@/mdx/components/Fields'), 'Fields')
const File = lazyNamed(() => import('@/mdx/components/Files'), 'File')
const Files = lazyNamed(() => import('@/mdx/components/Files'), 'Files')
const Folder = lazyNamed(() => import('@/mdx/components/Files'), 'Folder')
const Figure = lazy(() => import('@/mdx/components/Figure'))
const Frame = lazy(() => import('@/mdx/components/Frame'))
const Option = lazy(() => import('@/mdx/components/Option'))
const Output = lazy(() => import('@/mdx/components/Output'))
const Repo = lazy(() => import('@/mdx/components/Repo'))
const Step = lazyNamed(() => import('@/mdx/components/Steps'), 'Step')
const Steps = lazyNamed(() => import('@/mdx/components/Steps'), 'Steps')
const Tab = lazyNamed(() => import('@/mdx/components/Tabs'), 'Tab')
const Tabs = lazyNamed(() => import('@/mdx/components/Tabs'), 'Tabs')
const Terminal = lazy(() => import('@/mdx/components/Terminal'))
const Timeline = lazyNamed(() => import('@/mdx/components/Timeline'), 'Timeline')
const TimelineItem = lazyNamed(() => import('@/mdx/components/Timeline'), 'TimelineItem')
const Tweet = lazy(() => import('@/mdx/components/Tweet'))
const Video = lazy(() => import('@/mdx/components/Video'))
const Window = lazy(() => import('@/mdx/components/Window'))
const YouTube = lazy(() => import('@/mdx/components/YouTube'))

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
// Heavy MDX widgets are lazy; Suspense lives in MdxBody.
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
