import { useCallback, useEffect, useState } from 'react'
import { isMdxContentReady } from '@/content/mdx/compileMdx'
import { loadCategoriesList, loadNoteBySlug, loadNotesPage, loadPageContent, loadTagsList } from '@/data/content'
import { useAsyncResource } from '@/hooks/useAsyncResource'

function withMdxReady({ loading, data, error }, { isCurrent = null } = {}) {
  const waitingForMdx = data != null && !isMdxContentReady(data)
  const waitingForMatch = data != null && isCurrent != null && !isCurrent(data)

  return {
    loading: loading || waitingForMdx || waitingForMatch,
    data,
    error,
  }
}

export function usePageContent(slug) {
  const loader = useCallback(() => loadPageContent(slug), [slug])
  return withMdxReady(useAsyncResource(loader, [slug]))
}

export function useTagsList() {
  const loader = useCallback(() => loadTagsList(), [])
  return useAsyncResource(loader, [])
}

export function useCategoriesList() {
  const loader = useCallback(() => loadCategoriesList(), [])
  return useAsyncResource(loader, [])
}

export function useNotesPage({ page, pageSize = 10, query = '', tagIds = [], categoryIds = [] }) {
  const filterKey = `${query}\0${tagIds.join(',')}\0${categoryIds.join(',')}`
  const [state, setState] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    loadNotesPage({ page, pageSize, query, tagIds, categoryIds })
      .then((data) => {
        if (active) setState({ loading: false, data, error: null })
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })

    return () => {
      active = false
    }
  }, [page, pageSize, filterKey])

  return state
}

export function useNote(slug) {
  const loader = useCallback(() => loadNoteBySlug(slug), [slug])
  return withMdxReady(useAsyncResource(loader, [slug]), {
    isCurrent: (note) => note.slug === slug,
  })
}
