import { useEffect, useRef, useState } from 'react'
import { compileMdx } from '@/content/mdx/compileMdx'

function useMdxPreview(body, enabled = true) {
  const cacheRef = useRef({ body: null, Component: null })
  const [MdxContent, setMdxContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!body) {
      cacheRef.current = { body: null, Component: null }
      setMdxContent(null)
      setLoading(false)
      setError('')
      return undefined
    }

    if (!enabled) {
      setLoading(false)
      return undefined
    }

    if (cacheRef.current.body === body && cacheRef.current.Component) {
      setMdxContent(() => cacheRef.current.Component)
      setLoading(false)
      setError('')
      return undefined
    }

    let active = true
    const loadingTimer = setTimeout(() => {
      if (active) setLoading(true)
    }, 120)

    setError('')

    compileMdx(body)
      .then((Component) => {
        if (active) {
          cacheRef.current = { body, Component }
          setMdxContent(() => Component)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : String(err))
          setMdxContent(null)
          cacheRef.current = { body: null, Component: null }
        }
      })
      .finally(() => {
        clearTimeout(loadingTimer)
        if (active) setLoading(false)
      })

    return () => {
      active = false
      clearTimeout(loadingTimer)
    }
  }, [body, enabled])

  return { MdxContent, loading, error }
}

export default useMdxPreview
