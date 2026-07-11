import { useEffect, useState } from 'react'
import { compileMdx } from '@/mdx/compileMdx'

function useMdxPreview(body, enabled = true) {
  const [state, setState] = useState({
    sourceBody: '',
    MdxContent: null,
    loading: false,
    error: '',
  })

  // Only track body while preview is open — avoid effect churn on every keystroke in edit mode.
  const previewBody = enabled ? body : ''
  const ready = Boolean(previewBody) && state.sourceBody === previewBody && state.MdxContent != null

  useEffect(() => {
    if (!previewBody || ready) return undefined

    let active = true
    const loadingTimer = window.setTimeout(() => {
      if (active) setState((current) => ({ ...current, loading: true, error: '' }))
    }, 120)

    compileMdx(previewBody)
      .then((MdxContent) => {
        if (!active) return
        setState({ sourceBody: previewBody, MdxContent, loading: false, error: '' })
      })
      .catch((err) => {
        if (!active) return
        setState({
          sourceBody: previewBody,
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
  }, [previewBody, ready])

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
