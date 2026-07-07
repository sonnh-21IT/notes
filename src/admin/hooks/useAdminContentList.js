import { useCallback } from 'react'
import { listContent } from '@/data/admin'
import { useAsyncResource } from '@/hooks/useAsyncResource'

export function useAdminContentList() {
  const loader = useCallback(() => listContent(), [])
  return useAsyncResource(loader, [])
}
