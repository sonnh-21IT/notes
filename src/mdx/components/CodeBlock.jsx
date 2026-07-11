import { useEffect, useMemo, useRef, useState } from 'react'
import { getLanguage, getRawCode } from '@/mdx/components/codeBlockUtils'

function CodeBlock({ children, className = '', ...props }) {
  const shellRef = useRef(null)
  const copyTimerRef = useRef(0)
  const [copied, setCopied] = useState(false)
  const [highlight, setHighlight] = useState({ key: '', html: '' })
  const language = getLanguage(children, className)
  const rawCode = useMemo(() => getRawCode(children), [children])
  const sourceKey = `${language}\0${rawCode}`
  const highlightedHtml = highlight.key === sourceKey ? highlight.html : ''

  useEffect(() => () => window.clearTimeout(copyTimerRef.current), [])

  useEffect(() => {
    if (!rawCode) return undefined

    const shell = shellRef.current
    if (!shell) return undefined

    let active = true
    let observer

    const runHighlight = () => {
      import('@/mdx/codeHighlight')
        .then(({ highlightCodeToHtml }) => highlightCodeToHtml(rawCode, language))
        .then((html) => {
          if (active) setHighlight({ key: sourceKey, html })
        })
        .catch(() => {
          if (active) setHighlight({ key: sourceKey, html: '' })
        })
    }

    if (typeof IntersectionObserver === 'undefined') {
      runHighlight()
      return () => {
        active = false
      }
    }

    observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer?.disconnect()
      runHighlight()
    }, { rootMargin: '120px' })

    observer.observe(shell)

    return () => {
      active = false
      observer?.disconnect()
    }
  }, [rawCode, language, sourceKey])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode)
      setCopied(true)
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block-shell" ref={shellRef}>
      <div className="code-block-toolbar">
        {language ? <span className="code-language">{language}</span> : <span />}
        <button
          type="button"
          className="copy-button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
          title={copied ? 'Copied' : 'Copy'}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <pre
        className={['code-block', 'shiki', className].filter(Boolean).join(' ')}
        {...props}
      >
        {highlightedHtml ? (
          <code className={language ? `language-${language}` : undefined} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <code className={language ? `language-${language}` : undefined}>{rawCode}</code>
        )}
      </pre>
    </div>
  )
}

export default CodeBlock
