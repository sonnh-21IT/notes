import { useSiteContentState } from '@/context/ContentProvider'

export function useSiteContent() {
  const { status, data, error } = useSiteContentState()

  return {
    loading: status === 'loading',
    error,
    siteContent: data ?? {},
  }
}
