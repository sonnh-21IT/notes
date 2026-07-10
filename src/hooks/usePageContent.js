import { useCallback } from 'react'
import { isMdxContentReady } from '@/mdx/compileMdx'
import {
  loadCategoriesList,
  loadNoteBySlug,
  loadNotesPage,
  loadPageContent,
  loadPinnedNotes,
  loadTagsList,
} from '@/data/content'
import { useAsyncResource } from '@/hooks/useAsyncResource'

function withMdxReady(resource, { isCurrent = null } = {}) {
  const { loading, data, error, isInitialLoading, isValidating } = resource
  const waitingForMdx = data != null && !isMdxContentReady(data)
  const waitingForMatch = data != null && isCurrent != null && !isCurrent(data)
  const waiting = waitingForMdx || waitingForMatch

  return {
    loading: loading || waiting,
    isInitialLoading: isInitialLoading || (waiting && data == null),
    isValidating: isValidating || waiting,
    data,
    error,
  }
}

export function usePageContent(slug) {
  const loader = useCallback(() => loadPageContent(slug), [slug])
  return withMdxReady(useAsyncResource(loader, [slug], { keepPreviousData: false }))
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
  const loader = useCallback(
    () => loadNotesPage({ page, pageSize, query, tagIds, categoryIds }),
    [page, pageSize, query, tagIds, categoryIds],
  )

  return useAsyncResource(loader, [page, pageSize, query, tagIds, categoryIds], {
    keepPreviousData: true,
  })
}

export function usePinnedNotes({ limit = 5 } = {}) {
  const loader = useCallback(() => loadPinnedNotes({ limit }), [limit])
  return useAsyncResource(loader, [limit], { keepPreviousData: true })
}

export function useNote(slug) {
  const loader = useCallback(() => loadNoteBySlug(slug), [slug])
  return withMdxReady(useAsyncResource(loader, [slug], { keepPreviousData: false }), {
    isCurrent: (note) => note.slug === slug,
  })
}
