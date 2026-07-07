import { useCallback } from 'react'
import { listCategories, listNotes, listTags } from '@/data/admin'
import { useAsyncResource } from '@/hooks/useAsyncResource'

export function useAdminNotesCatalog() {
  const loader = useCallback(
    () => Promise.all([listNotes(), listTags(), listCategories()])
      .then(([notes, tags, categories]) => ({ notes, tags, categories })),
    [],
  )

  return useAsyncResource(loader, [])
}
