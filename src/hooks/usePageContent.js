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
  const loader = useCallback(
    () => loadNotesPage({ page, pageSize, query, tagIds, categoryIds }),
    [page, pageSize, query, tagIds, categoryIds],
  )

  return useAsyncResource(loader, [page, pageSize, query, tagIds, categoryIds])
}

export function usePinnedNotes({ limit = 5 } = {}) {
  const loader = useCallback(() => loadPinnedNotes({ limit }), [limit])
  return useAsyncResource(loader, [limit])
}

export function useNote(slug) {
  const loader = useCallback(() => loadNoteBySlug(slug), [slug])
  return withMdxReady(useAsyncResource(loader, [slug]), {
    isCurrent: (note) => note.slug === slug,
  })
}
