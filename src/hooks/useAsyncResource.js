import { useEffect, useState } from 'react'

export function useAsyncResource(loader, deps, { keepPreviousData = true } = {}) {
  const depsKey = JSON.stringify(deps)

  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
    depsKey,
  })

  const stale = state.depsKey !== depsKey

  useEffect(() => {
    let active = true

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
    const data = keepPreviousData ? state.data : null
    return {
      loading: true,
      isInitialLoading: data == null,
      isValidating: true,
      data,
      error: null,
    }
  }

  return {
    loading: state.loading,
    isInitialLoading: state.loading && state.data == null,
    isValidating: state.loading,
    data: state.data,
    error: state.error,
  }
}
