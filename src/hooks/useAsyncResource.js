import { useEffect, useMemo, useState } from 'react'

export function useAsyncResource(loader, deps = []) {
  const depsKey = useMemo(() => JSON.stringify(deps), deps)

  const [state, setState] = useState(() => ({
    loading: true,
    data: null,
    error: null,
    depsKey,
  }))

  const stale = state.depsKey !== depsKey

  useEffect(() => {
    let active = true
    setState({ loading: true, data: null, error: null, depsKey })

    loader()
      .then((data) => {
        if (active) setState({ loading: false, data, error: null, depsKey })
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            depsKey,
          })
        }
      })

    return () => {
      active = false
    }
  }, [depsKey, loader])

  if (stale) {
    return { loading: true, data: null, error: null }
  }

  return {
    loading: state.loading,
    data: state.data,
    error: state.error,
  }
}
