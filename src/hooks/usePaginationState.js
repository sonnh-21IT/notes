import { useCallback, useState } from 'react'

export function usePaginationState(filterKey) {
  const [state, setState] = useState({ filterKey, page: 1 })

  // ponytail: derive reset page when filterKey changes — no render-time or effect setState
  const pageNumber = state.filterKey === filterKey ? state.page : 1

  const setPageNumber = useCallback((next) => {
    setState((current) => {
      const basePage = current.filterKey === filterKey ? current.page : 1
      const page = typeof next === 'function' ? next(basePage) : next
      return { filterKey, page }
    })
  }, [filterKey])

  return { pageNumber, setPageNumber }
}
