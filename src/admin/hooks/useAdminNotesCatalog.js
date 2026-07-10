import { useCallback } from 'react'
import { listCategories, listNotes, listTags } from '@/data/admin'
import { useAsyncResource } from '@/hooks/useAsyncResource'

export function useAdminNotesList() {
  const loader = useCallback(() => listNotes(), [])
  return useAsyncResource(loader, [])
}

export function useAdminTagsList() {
  const loader = useCallback(() => listTags(), [])
  return useAsyncResource(loader, [])
}

export function useAdminCategoriesList() {
  const loader = useCallback(() => listCategories(), [])
  return useAsyncResource(loader, [])
}
