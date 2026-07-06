import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react'
import { highlightCodeToHtml } from '@/content/mdx/codeHighlight'

function getLanguage(children, className = '') {
  const fromPre = className.match(/language-([\w-]+)/)?.[1]
  if (fromPre) return fromPre

  if (isValidElement(children) && typeof children.props?.className === 'string') {
    return children.props.className.match(/language-([\w-]+)/)?.[1] || ''
  }

  return ''
}

function getRawCode(children) {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return Children.toArray(children).map(getRawCode).join('')
  if (isValidElement(children)) return getRawCode(children.props.children)
  return ''
}

function CodeBlock({ children, className = '', ...props }) {
  const preRef = useRef(null)
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const language = getLanguage(children, className)
  const rawCode = useMemo(() => getRawCode(children), [children])

  useEffect(() => {
    let active = true
    setHighlightedHtml('')

    if (!rawCode) return () => {
      active = false
    }

    highlightCodeToHtml(rawCode, language)
      .then((html) => {
        if (active) setHighlightedHtml(html)
      })
      .catch(() => {
        if (active) setHighlightedHtml('')
      })

    return () => {
      active = false
    }
  }, [rawCode, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="code-block-shell">
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
        ref={preRef}
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
