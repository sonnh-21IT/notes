import '@/styles/public/mdx/timeline.css'
import { Children } from 'react'

function TimelineItem({ title, date, children }) {
  return (
    <div className="mdx-timeline-item">
      <span className="mdx-timeline-marker" aria-hidden />
      <div className="mdx-timeline-content">
        {date ? <time className="mdx-timeline-date">{date}</time> : null}
        {title ? <strong className="mdx-timeline-title">{title}</strong> : null}
        {children ? <div className="mdx-timeline-body">{children}</div> : null}
      </div>
    </div>
  )
}

function Timeline({ children }) {
  const items = Children.toArray(children).filter(
    (child) => typeof child !== 'string' && typeof child !== 'number',
  )

  return <div className="mdx-timeline">{items}</div>
}

export { Timeline, TimelineItem }
