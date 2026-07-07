import { useEffect, useState } from 'react'
import { compileMdx } from '@/mdx/compileMdx'

function useMdxPreview(body, enabled = true) {
  const [state, setState] = useState({
    sourceBody: '',
    MdxContent: null,
    loading: false,
    error: '',
  })

  const ready = Boolean(body) && state.sourceBody === body && state.MdxContent != null

  useEffect(() => {
    if (!body || !enabled || ready) return undefined

    let active = true
    const loadingTimer = window.setTimeout(() => {
      if (active) setState((current) => ({ ...current, loading: true, error: '' }))
    }, 120)

    compileMdx(body)
      .then((MdxContent) => {
        if (!active) return
        setState({ sourceBody: body, MdxContent, loading: false, error: '' })
      })
      .catch((err) => {
        if (!active) return
        setState({
          sourceBody: body,
          MdxContent: null,
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        })
      })
      .finally(() => {
        window.clearTimeout(loadingTimer)
      })

    return () => {
      active = false
      window.clearTimeout(loadingTimer)
    }
  }, [body, enabled, ready])

  if (!body) return { MdxContent: null, loading: false, error: '' }

  if (!enabled) {
    return {
      MdxContent: state.sourceBody === body ? state.MdxContent : null,
      loading: false,
      error: '',
    }
  }

  if (ready) {
    return { MdxContent: state.MdxContent, loading: false, error: state.error }
  }

  return { MdxContent: null, loading: state.loading, error: state.error }
}

export default useMdxPreview
