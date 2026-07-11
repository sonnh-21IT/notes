import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loadSiteContent, onSiteContentInvalidate } from '@/data/content'

const SiteContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',
    data: {},
    error: null,
  })
  const [reloadTick, setReloadTick] = useState(0)

  const reload = useCallback(() => {
    setReloadTick((tick) => tick + 1)
  }, [])

  useEffect(() => onSiteContentInvalidate(reload), [reload])

  useEffect(() => {
    let active = true

    loadSiteContent()
      .then((data) => {
        if (active) setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (active) {
          setState((current) => ({
            status: Object.keys(current.data || {}).length ? 'ready' : 'error',
            data: current.data || {},
            error: error instanceof Error ? error : new Error(String(error)),
          }))
        }
      })

    return () => {
      active = false
    }
  }, [reloadTick])

  return <SiteContentContext.Provider value={state}>{children}</SiteContentContext.Provider>
}

export function useSiteContentState() {
  const state = useContext(SiteContentContext)
  if (!state) {
    throw new Error('useSiteContentState must be used within ContentProvider')
  }
  return state
}
